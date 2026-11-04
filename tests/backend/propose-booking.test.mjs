import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import handler from "../../netlify/functions/propose-booking.mjs";
import { malformedDatabaseTimes, precisionCases } from "./fixtures/timePrecisionCases.mjs";

let fetchMock;
let patches;
let rows;
let booking;
let authorized;
let authRequests;

const ACCESS_TOKEN = "test-access-placeholder";
const SERVICE_KEY = "test-placeholder-not-a-credential";

const request = (overrides = {}, authorization = `Bearer ${ACCESS_TOKEN}`) =>
  new Request("https://app.example.invalid/.netlify/functions/propose-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization === null ? {} : { Authorization: authorization }),
    },
    body: JSON.stringify({ bookingId: 7, proposedDate: "2030-01-08", proposedTime: "10:00", ...overrides }),
  });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-01-07T09:00:00Z"));
  vi.stubEnv("SUPABASE_URL", "https://supabase.example.invalid");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  patches = [];
  rows = [];
  authorized = true;
  authRequests = [];
  booking = {
    id: 7, status: "pending", appointment_type: "studio",
    appointment_date: "2030-01-09", appointment_time: "09:00:00", proposal_status: null,
  };
  fetchMock = vi.fn(async (input, options = {}) => {
    const url = new URL(input);
    expect(url.origin).toBe("https://supabase.example.invalid");
    if (url.pathname === "/auth/v1/user") {
      const headers = new Headers(options.headers);
      const authorization = headers.get("authorization");
      const apikey = headers.get("apikey");
      const status =
        authorization === `Bearer ${ACCESS_TOKEN}` && apikey === SERVICE_KEY
          ? 200
          : 401;
      authRequests.push({ authorization, apikey, status });
      return Response.json(
        status === 200 ? { id: "test-admin" } : { message: "Token di prova rifiutato" },
        { status },
      );
    }
    if (url.pathname === "/rest/v1/admin_users") {
      expect(url.searchParams.get("user_id")).toBe("eq.test-admin");
      return Response.json(authorized ? [{ user_id: "test-admin" }] : []);
    }
    if (url.pathname === "/rest/v1/bookings") {
      if (options.method === "PATCH") {
        expect(url.searchParams.get("id")).toBe("eq.7");
        expect(url.searchParams.get("status")).toBe("eq.pending");
        const patch = JSON.parse(options.body);
        patches.push(patch);
        return Response.json([{ id: 7, status: "pending", ...patch }]);
      }
      if (url.searchParams.has("id")) return Response.json([booking]);
      expect(url.searchParams.get("status")).toBe("eq.confirmed");
      expect(url.searchParams.get("appointment_date")).toBe("eq.2030-01-08");
      return Response.json(rows);
    }
    throw new Error("HTTP mock non predisposto");
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("precisione dei conflitti delle proposte", () => {
  test.each(precisionCases)("$label", async ({ confirmedType, confirmedTime, duration, requestedType, requestedTime, conflict }) => {
    booking.appointment_type = requestedType;
    rows = [{ appointment_type: confirmedType, appointment_time: confirmedTime, duration_minutes: duration }];
    const response = await handler(request({ proposedTime: requestedTime }));
    const body = await response.json();

    expect(response.status).toBe(conflict ? 409 : 200);
    expect(body.success).toBe(!conflict);
    if (conflict) {
      expect(patches).toEqual([]);
    } else {
      expect(patches).toEqual([{
        proposed_date: "2030-01-08", proposed_time: requestedTime, proposal_note: null,
        proposal_status: "draft", proposal_sent_at: null,
      }]);
      expect(body.booking.status).toBe("pending");
    }
  });

  test.each(malformedDatabaseTimes)("rifiuta orario DB malformato %s senza salvare bozze", async (time) => {
    rows = [{ appointment_type: "studio", appointment_time: time, duration_minutes: 60 }];
    const response = await handler(request());
    expect(response.status).toBe(502);
    expect((await response.json()).success).toBe(false);
    expect(patches).toEqual([]);
  });

  test("distingue l'orario proposto dall'originale anche se differiscono solo per i secondi", async () => {
    booking.appointment_date = "2030-01-08";
    booking.appointment_time = "09:00:30";
    const response = await handler(request({ proposedTime: "09:00" }));
    expect(response.status).toBe(200);
    expect(patches).toHaveLength(1);
    expect(patches[0].proposal_status).toBe("draft");
  });

  test("continua a rifiutare una proposta esattamente uguale all'originale", async () => {
    booking.appointment_date = "2030-01-08";
    booking.appointment_time = "10:00:00.000000";
    expect((await handler(request())).status).toBe(400);
    expect(patches).toEqual([]);
  });
});

describe("protezioni esistenti preservate", () => {
  test.each([
    null,
    "",
    "Basic test-access-placeholder",
    "Bearer",
    "Bearer ",
    "Bearer token con spazi",
    "Bearer token\tsecondo",
  ])("token assente o header malformato %j: rifiuto prima di Auth", async (authorization) => {
    const response = await handler(request({}, authorization));
    expect(response.status).toBe(401);
    expect((await response.json()).success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authRequests).toEqual([]);
    expect(patches).toEqual([]);
  });

  test.each(["test-rejected-placeholder", "not-a-jwt"])("Auth rifiuta il token %s con HTTP 401", async (token) => {
    const response = await handler(request({}, `Bearer ${token}`));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false, message: "Sessione non valida.",
    });
    // Asserzioni fuori dal mock: non possono essere assorbite dal catch dell'handler.
    expect(authRequests).toEqual([{
      authorization: `Bearer ${token}`, apikey: SERVICE_KEY, status: 401,
    }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(patches).toEqual([]);
  });

  test("utente autenticato non presente in admin_users: nessun accesso alle prenotazioni", async () => {
    authorized = false;
    const response = await handler(request());
    expect(response.status).toBe(403);
    expect((await response.json()).success).toBe(false);
    expect(authRequests).toEqual([{
      authorization: `Bearer ${ACCESS_TOKEN}`, apikey: SERVICE_KEY, status: 200,
    }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const membershipUrl = new URL(fetchMock.mock.calls[1][0]);
    expect(membershipUrl.pathname).toBe("/rest/v1/admin_users");
    expect(membershipUrl.searchParams.get("user_id")).toBe("eq.test-admin");
    expect(patches).toEqual([]);
  });

  test("amministratore valido: inoltra il token utente ad Auth e salva solo una bozza", async () => {
    const response = await handler(request());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(authRequests).toEqual([{
      authorization: `Bearer ${ACCESS_TOKEN}`, apikey: SERVICE_KEY, status: 200,
    }]);
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(patches).toEqual([{
      proposed_date: "2030-01-08", proposed_time: "10:00", proposal_note: null,
      proposal_status: "draft", proposal_sent_at: null,
    }]);
    expect(body.booking.status).toBe("pending");
  });

  test("gli orari proposti restano limitati a HH:MM", async () => {
    expect((await handler(request({ proposedTime: "10:00:30" }))).status).toBe(400);
    expect(patches).toEqual([]);
  });
  test("una richiesta già confermata non è modificabile", async () => {
    booking.status = "confirmed";
    expect((await handler(request())).status).toBe(409);
    expect(patches).toEqual([]);
  });
});
