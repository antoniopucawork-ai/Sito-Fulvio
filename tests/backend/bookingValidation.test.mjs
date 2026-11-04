import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { validateBooking } from "../../netlify/functions/_lib/bookingValidation.mjs";
import { isFutureAppointment } from "../../netlify/functions/_lib/bookingTime.mjs";

const validPayload = (overrides = {}) => ({
  firstName: "Mario",
  lastName: "Rossi",
  email: "mario@example.invalid",
  phone: "+39 3331234567",
  appointmentType: "video",
  date: "2030-01-08",
  time: "09:00",
  privacyAccepted: true,
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-01-07T09:00:00Z")); // 10:00 Europe/Rome
});

afterEach(() => vi.useRealTimers());

describe("durate e approvazione manuale", () => {
  test.each([["video", 30], ["studio", 60], ["azienda", 60]])(
    "%s: durata server %i e stato pending anche con input manipolato",
    (appointmentType, duration) => {
      const result = validateBooking(validPayload({
        appointmentType, companyName: "Impresa", companyAddress: "Via di prova 1",
        duration: 999, status: "confirmed", approved_by: "client-forged",
      }));
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toMatchObject({ appointmentType, duration, status: "pending" });
      expect(result.data).not.toHaveProperty("approved_by");
    },
  );

  test("normalizza e limita i testi senza conservare campi aziendali per una videochiamata", () => {
    const result = validateBooking(validPayload({
      firstName: "  Mario  ", email: "  MARIO@EXAMPLE.INVALID  ",
      companyName: "non pertinente", companyAddress: "non pertinente",
      notes: "x".repeat(600),
    }));
    expect(result.valid).toBe(true);
    expect(result.data).toMatchObject({ firstName: "Mario", email: "mario@example.invalid", companyName: "", companyAddress: "" });
    expect(result.data.notes).toHaveLength(500);
  });
});

describe("fasce lavorative e allineamento", () => {
  test.each([
    ["video", "09:00"], ["video", "12:30"], ["video", "14:30"], ["video", "18:00"],
    ["studio", "09:00"], ["studio", "12:00"], ["studio", "14:30"], ["studio", "17:30"],
    ["azienda", "09:00"], ["azienda", "12:00"], ["azienda", "14:30"], ["azienda", "17:30"],
  ])("accetta %s alle %s", (appointmentType, time) => {
    expect(validateBooking(validPayload({ appointmentType, time, companyName: "Impresa", companyAddress: "Via 1" })).valid).toBe(true);
  });

  test.each([
    ["video", "08:30"], ["video", "13:00"], ["video", "14:00"], ["video", "18:30"],
    ["video", "09:15"], ["studio", "12:30"], ["studio", "18:00"], ["studio", "15:00"],
    ["azienda", "13:00"], ["azienda", "18:00"],
  ])("respinge %s alle %s", (appointmentType, time) => {
    const result = validateBooking(validPayload({ appointmentType, time, companyName: "Impresa", companyAddress: "Via 1" }));
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty("time");
    expect(result.data).toBeNull();
  });
});

describe("date e orologio dello studio", () => {
  test.each(["2030-01-05", "2030-01-06", "2030-02-30", "2030-13-01", "2030-00-08", "2030-1-08", "non-data", "", null])(
    "respinge weekend o data non valida: %s", (date) => {
      const result = validateBooking(validPayload({ date }));
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty("date");
    },
  );

  test.each(["09:00", "09:30", "10:00"])("respinge oggi alle %s, ora corrente 10:00 italiana", (time) => {
    expect(validateBooking(validPayload({ date: "2030-01-07", time })).valid).toBe(false);
  });
  test("respinge un giorno lavorativo nel passato", () => {
    expect(validateBooking(validPayload({ date: "2030-01-04" })).errors).toHaveProperty("date");
  });
  test("accetta uno slot successivo nello stesso giorno", () => {
    expect(validateBooking(validPayload({ date: "2030-01-07", time: "10:30" })).valid).toBe(true);
  });
  test("usa l'ora legale italiana, non l'ora UTC", () => {
    vi.setSystemTime(new Date("2030-07-08T08:00:00Z")); // 10:00 in Italia
    expect(validateBooking(validPayload({ date: "2030-07-08", time: "09:30" })).valid).toBe(false);
    expect(validateBooking(validPayload({ date: "2030-07-08", time: "10:30" })).valid).toBe(true);
  });
  test("usa la data italiana quando UTC è ancora il giorno precedente", () => {
    vi.setSystemTime(new Date("2030-01-07T23:30:00Z")); // 8 gennaio in Italia
    expect(validateBooking(validPayload({ date: "2030-01-07", time: "18:00" })).valid).toBe(false);
    expect(validateBooking(validPayload()).valid).toBe(true);
  });
});

describe("input mancanti o manipolati", () => {
  test.each([null, undefined, [], "test", 42])("respinge payload non oggetto: %j", (payload) => {
    expect(validateBooking(payload)).toMatchObject({ valid: false, data: null, errors: { request: expect.any(String) } });
  });
  test.each(["firstName", "lastName", "email", "phone", "appointmentType", "date", "time", "privacyAccepted"])(
    "richiede %s", (field) => {
      const payload = validPayload();
      delete payload[field];
      const result = validateBooking(payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty(field);
      expect(result.data).toBeNull();
    },
  );
  test.each([
    ["email", "non-email"], ["phone", "abc"], ["time", "24:00"], ["time", "09:60"],
    ["time", "09:00:00"], ["time", ["09:00"]], ["date", ["2030-01-08"]],
    ["firstName", { injected: true }], ["privacyAccepted", "true"], ["privacyAccepted", 1],
  ])("respinge campo %s manipolato: %j", (field, value) => {
    const result = validateBooking(validPayload({ [field]: value }));
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty(field);
    expect(result.data).toBeNull();
  });
  test.each(["non-previsto", "__proto__", "constructor", null, ["video"], { toString: null }])(
    "respinge modalità non stringa o sconosciuta senza eccezioni: %j", (appointmentType) => {
      const result = validateBooking(validPayload({ appointmentType }));
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty("appointmentType");
      expect(result.data).toBeNull();
    },
  );
  test.each(["companyName", "companyAddress"])("visita aziendale richiede %s", (field) => {
    const payload = validPayload({ appointmentType: "azienda", companyName: "Impresa", companyAddress: "Via 1", [field]: " " });
    expect(validateBooking(payload).errors).toHaveProperty(field);
  });
});

describe("confronto temporale puro con istante esplicito", () => {
  test.each([
    ["2030-01-04", "18:00", false],
    ["2030-01-08", "09:00", true],
    ["2030-01-07", "09:30", false],
    ["2030-01-07", "10:00", false],
    ["2030-01-07", "10:30", true],
  ])("%s %s: futuro=%s", (date, time, expected) => {
    expect(isFutureAppointment(date, time, { date: "2030-01-07", time: "10:00" })).toBe(expected);
  });
});
