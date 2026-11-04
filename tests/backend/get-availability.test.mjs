import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import handler from "../../netlify/functions/get-availability.mjs";
import { malformedDatabaseTimes, precisionCases } from "./fixtures/timePrecisionCases.mjs";

const videoSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
const hourSlots = ["09:00", "10:00", "11:00", "12:00", "14:30", "15:30", "16:30", "17:30"];
const confirmed = (overrides = {}) => ({
  appointment_time: "09:00:00", duration_minutes: 60, appointment_type: "studio", ...overrides,
});
let fetchMock;

const request = (params = { date: "2030-01-08", type: "video" }, method = "GET") =>
  new Request(`https://app.example.invalid/.netlify/functions/get-availability?${new URLSearchParams(params)}`, { method });

const getAvailability = async (params) => {
  const response = await handler(request(params));
  return { response, body: await response.json() };
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-01-07T09:00:00Z")); // 10:00 Europe/Rome
  vi.stubEnv("SUPABASE_URL", "https://supabase.example.invalid");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-placeholder-not-a-credential");
  // Nessun fallback al fetch reale: una chiamata non predisposta fallisce.
  fetchMock = vi.fn().mockRejectedValue(new Error("HTTP mock non predisposto"));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("slot, durate e orari", () => {
  test.each([["video", videoSlots], ["studio", hourSlots], ["azienda", hourSlots]])(
    "%s restituisce l'elenco esatto degli slot, rispettando chiusure e durata",
    async (type, expectedSlots) => {
      fetchMock.mockResolvedValue(Response.json([]));
      const { response, body } = await getAvailability({ date: "2030-01-08", type });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(body).toEqual({ success: true, date: "2030-01-08", type, availableSlots: expectedSlots });
    },
  );
});

describe("conflitti e buffer", () => {
  test.each([
    ["09:00", ["09:00", "09:30"]],
    ["09:00:00", ["09:00", "09:30"]],
    ["09:00:00.000000", ["09:00", "09:30"]],
    ["09:00:00.123456", ["09:00", "09:30", "10:00"]],
  ])("supporta l'orario PostgreSQL valido %s senza perdere precisione", async (appointment_time, occupiedSlots) => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_time })]));
    const { response, body } = await getAvailability({ date: "2030-01-08", type: "video" });
    expect(response.status).toBe(200);
    expect(body.availableSlots).toEqual(videoSlots.filter(slot => !occupiedSlots.includes(slot)));
  });

  test.each([
    ["studio", confirmed(), ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]],
    ["video", confirmed({ appointment_type: "video", duration_minutes: 30 }), videoSlots.filter(slot => slot !== "09:00")],
  ])("blocca le sovrapposizioni effettive di %s e consente intervalli consecutivi", async (_name, row, expectedSlots) => {
    fetchMock.mockResolvedValue(Response.json([row]));
    const { body } = await getAvailability({ date: "2030-01-08", type: "video" });
    expect(body.availableSlots).toEqual(expectedSlots);
  });

  test("azienda confermata 09:00–10:00: studio alle 11:00 bloccato, alle 12:00 consentito", async () => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_type: "azienda" })]));
    const { body } = await getAvailability({ date: "2030-01-08", type: "studio" });
    expect(body.availableSlots).toEqual(["12:00", "14:30", "15:30", "16:30", "17:30"]);
  });

  test("applica entrambi i buffer e consente il contatto esatto ai confini", async () => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_type: "azienda", appointment_time: "12:00:00" })]));
    const { body } = await getAvailability({ date: "2030-01-08", type: "video" });
    expect(body.availableSlots).toEqual(["09:00", "09:30", "10:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]);
  });

  test("applica il viaggio anche alla visita aziendale richiesta", async () => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_time: "11:00:00" })]));
    const { body } = await getAvailability({ date: "2030-01-08", type: "azienda" });
    expect(body.availableSlots).toEqual(["14:30", "15:30", "16:30", "17:30"]);
  });

  test("due aziende nella stessa giornata: estende entrambi gli intervalli", async () => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_type: "azienda" })]));
    const { body } = await getAvailability({ date: "2030-01-08", type: "azienda" });
    expect(body.availableSlots).toEqual(["14:30", "15:30", "16:30", "17:30"]);
  });

  test("interroga solo la data richiesta e le prenotazioni confirmed; pending e rejected non occupano", async () => {
    const rows = [
      { ...confirmed(), status: "pending", appointment_date: "2030-01-08" },
      { ...confirmed(), status: "rejected", appointment_date: "2030-01-08" },
      { ...confirmed(), status: "confirmed", appointment_date: "2030-01-09" },
      { ...confirmed({ appointment_time: "10:00:00" }), status: "confirmed", appointment_date: "2030-01-08" },
    ];
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input);
      expect(url.origin).toBe("https://supabase.example.invalid");
      expect(url.pathname).toBe("/rest/v1/bookings");
      expect(url.searchParams.get("select")).toBe("appointment_time,duration_minutes,appointment_type");
      expect(url.searchParams.get("status")).toBe("eq.confirmed");
      expect(url.searchParams.get("appointment_date")).toBe("eq.2030-01-08");
      // Simula il filtro REST: restituire tutte le righe sarebbe un mock irreale.
      return Response.json(rows.filter(row =>
        `eq.${row.status}` === url.searchParams.get("status") &&
        `eq.${row.appointment_date}` === url.searchParams.get("appointment_date")));
    });
    const { response, body } = await getAvailability({ date: "2030-01-08", type: "studio" });
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(body.availableSlots).toEqual(["09:00", "11:00", "12:00", "14:30", "15:30", "16:30", "17:30"]);
  });
});

describe("date e parametri", () => {
  test.each(["2030-01-05", "2030-01-06", "2030-02-30", "2030-13-01", "2030-00-08", "2030-1-08", "non-data", ""])(
    "respinge data non lavorativa o invalida %s prima del fetch", async (date) => {
      const { response, body } = await getAvailability({ date, type: "video" });
      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
  test.each([{}, { date: "2030-01-08" }, { type: "video" }, { date: "2030-01-08", type: "constructor" }, { date: "2030-01-08", type: "__proto__" }])(
    "respinge parametri mancanti/manipolati: %j", async (params) => {
      const { response, body } = await getAvailability(params);
      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
  test("respinge POST senza interpellare Supabase", async () => {
    const response = await handler(request(undefined, "POST"));
    expect(response.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  test("non offre slot in un giorno passato", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    const { response, body } = await getAvailability({ date: "2030-01-04", type: "video" });
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, availableSlots: [] });
  });
  test("oggi esclude slot passati e ora esatta, usando Europe/Rome", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    const { body } = await getAvailability({ date: "2030-01-07", type: "video" });
    expect(body.availableSlots).toEqual(["10:30", "11:00", "11:30", "12:00", "12:30", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]);
  });
  test("a fine giornata non restituisce disponibilità residua", async () => {
    vi.setSystemTime(new Date("2030-01-07T17:30:00Z")); // 18:30 in Italia
    fetchMock.mockResolvedValue(Response.json([]));
    const { response, body } = await getAvailability({ date: "2030-01-07", type: "video" });
    expect(response.status).toBe(200);
    expect(body.availableSlots).toEqual([]);
  });

  test("rispetta l'ora legale italiana", async () => {
    vi.setSystemTime(new Date("2030-07-08T08:00:00Z"));
    fetchMock.mockResolvedValue(Response.json([]));
    const { body } = await getAvailability({ date: "2030-07-08", type: "studio" });
    expect(body.availableSlots).toEqual(["11:00", "12:00", "14:30", "15:30", "16:30", "17:30"]);
  });
});

describe("errori: nessuna falsa disponibilità", () => {
  test.each(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])("configurazione mancante %s", async (name) => {
    vi.stubEnv(name, "");
    const { response, body } = await getAvailability();
    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  test.each([401, 403, 429, 500, 503])("errore HTTP Supabase %i non diventa calendario libero", async (status) => {
    fetchMock.mockResolvedValue(Response.json({ error: "test" }, { status }));
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
  test.each([new Error("rete simulata"), new DOMException("timeout simulato", "TimeoutError")])("errore rete/timeout: %s", async (error) => {
    fetchMock.mockRejectedValue(error);
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
  test("JSON malformato non diventa calendario libero", async () => {
    fetchMock.mockResolvedValue(new Response("JSON non valido"));
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
  test.each([null, {}, { bookings: [] }])("risposta non array: %j", async (value) => {
    fetchMock.mockResolvedValue(Response.json(value));
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
  test.each([
    null, {}, confirmed({ duration_minutes: 0 }), confirmed({ duration_minutes: -1 }),
    confirmed({ duration_minutes: "non-valida" }), confirmed({ appointment_type: "sconosciuto" }),
    confirmed({ appointment_time: "25:00:00" }), confirmed({ appointment_time: "09:60:00" }),
    confirmed({ appointment_time: "09:00:non-valido" }), confirmed({ appointment_time: "09::00" }),
    confirmed({ appointment_time: "09:00:99" }),
  ])("riga confermata corrotta: %j", async (row) => {
    fetchMock.mockResolvedValue(Response.json([row]));
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
});

describe("precisione PostgreSQL e confini dei buffer", () => {
  test.each(precisionCases)("$label", async ({ confirmedType, confirmedTime, duration, requestedType, requestedTime, conflict }) => {
    fetchMock.mockResolvedValue(Response.json([confirmed({
      appointment_type: confirmedType, appointment_time: confirmedTime, duration_minutes: duration,
    })]));
    const { response, body } = await getAvailability({ date: "2030-01-08", type: requestedType });
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.availableSlots.includes(requestedTime)).toBe(!conflict);
  });

  test.each(malformedDatabaseTimes)("orario DB malformato %s: nessuna falsa disponibilità", async (appointment_time) => {
    fetchMock.mockResolvedValue(Response.json([confirmed({ appointment_time })]));
    const { response, body } = await getAvailability();
    expect(response.status).toBe(502);
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty("availableSlots");
  });
});
