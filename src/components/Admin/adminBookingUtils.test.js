import { describe, expect, test } from "vitest";
import { findBookingConflict } from "./adminBookingUtils.js";

const makeBooking = (overrides = {}) => ({
  id: 1,
  appointment_date: "2030-01-07",
  appointment_time: "09:00:00",
  appointment_type: "studio",
  duration_minutes: 60,
  status: "confirmed",
  ...overrides,
});

// Alcuni orari non sono slot pubblici: verificano i confini matematici
// del conflitto, indipendentemente dalla validazione degli orari lavorativi.
const intervalCases = [
  ["appuntamenti normali sovrapposti", "studio", "09:00", 60, "video", "09:30", 30, true],
  ["appuntamento interamente contenuto nell'altro", "studio", "09:00", 60, "video", "09:15", 30, true],
  ["appuntamenti consecutivi", "studio", "09:00", 60, "video", "10:00", 30, false],
  ["appuntamento che termina all'inizio dell'altro", "studio", "09:00", 60, "video", "08:30", 30, false],
  ["azienda alle 09:00 e studio alle 11:00", "azienda", "09:00", 60, "studio", "11:00", 60, true],
  ["viaggio prima della visita aziendale", "azienda", "12:00", 60, "studio", "10:00", 60, true],
  ["contatto esatto con fine viaggio", "azienda", "09:00", 60, "studio", "11:30", 60, false],
  ["contatto esatto con inizio viaggio", "azienda", "12:00", 60, "video", "10:00", 30, false],
  ["un minuto dentro il viaggio successivo", "azienda", "09:00", 60, "video", "11:29", 30, true],
  ["un minuto dentro il viaggio precedente", "azienda", "12:00", 60, "video", "10:01", 30, true],
  ["appuntamento oltre il buffer aziendale", "azienda", "09:00", 60, "studio", "12:00", 60, false],
  ["due aziende con buffer sovrapposti", "azienda", "09:00", 60, "azienda", "12:00", 60, true],
  ["due aziende con buffer a contatto", "azienda", "09:00", 60, "azienda", "13:00", 60, false],
  ["due aziende con un minuto di sovrapposizione dei buffer", "azienda", "09:00", 60, "azienda", "12:59", 60, true],
  ["due aziende sufficientemente distanti", "azienda", "09:00", 60, "azienda", "14:30", 60, false],
  ["appuntamenti normali distanti", "studio", "09:00", 60, "studio", "12:00", 60, false],
];

for (const reverse of [false, true]) {
  describe(reverse ? "buffer sulla richiesta: ordine invertito" : "buffer sulla prenotazione confermata", () => {
    test.each(intervalCases)("%s", (_name, typeA, timeA, durationA, typeB, timeB, durationB, expected) => {
      const first = {
        appointment_type: typeA,
        appointment_time: `${timeA}:00`,
        duration_minutes: durationA,
      };
      const second = {
        appointment_type: typeB,
        appointment_time: `${timeB}:00`,
        duration_minutes: durationB,
      };
      const confirmed = makeBooking(reverse ? second : first);
      const requested = makeBooking({
        ...(reverse ? first : second),
        id: 2,
        status: "pending",
      });

      expect(findBookingConflict(requested, [confirmed])).toBe(
        expected ? confirmed : null,
      );
    });
  });
}

describe("selezione degli appuntamenti che occupano disponibilità", () => {
  test.each(["pending", "rejected", "cancelled"])("ignora una prenotazione %s anche con viaggio sovrapposto", (status) => {
    const requested = makeBooking({ id: 2, status: "pending" });
    const other = makeBooking({ appointment_type: "azienda", status });

    expect(findBookingConflict(requested, [other])).toBeNull();
  });

  test("ignora appuntamenti in giorni differenti", () => {
    const requested = makeBooking({ id: 2, status: "pending" });
    const other = makeBooking({
      appointment_type: "azienda",
      appointment_date: "2030-01-08",
    });

    expect(findBookingConflict(requested, [other])).toBeNull();
  });

  test("non considera la prenotazione stessa come conflitto", () => {
    const booking = makeBooking({ appointment_type: "azienda" });

    expect(findBookingConflict(booking, [booking])).toBeNull();
  });

  test("restituisce il primo appuntamento confermato in conflitto", () => {
    const requested = makeBooking({ id: 4, status: "pending" });
    const pending = makeBooking({ status: "pending" });
    const confirmed = makeBooking({ id: 2 });
    const laterConflict = makeBooking({ id: 3 });

    expect(findBookingConflict(requested, [pending, confirmed, laterConflict])).toBe(confirmed);
  });

  test("nessun conflitto senza richiesta o con calendario vuoto", () => {
    expect(findBookingConflict(null, [makeBooking()])).toBeNull();
    expect(findBookingConflict(makeBooking(), [])).toBeNull();
  });

  test.each([
    { appointment_time: "non-valido" },
    { duration_minutes: 0 },
    { duration_minutes: -30 },
    { duration_minutes: "non-valida" },
  ])("mantiene la gestione dei dati temporali non validi: %j", (invalidFields) => {
    const requested = makeBooking({ id: 2, status: "pending" });
    const other = makeBooking();

    expect(findBookingConflict({ ...requested, ...invalidFields }, [other])).toBeNull();
    expect(findBookingConflict(requested, [{ ...other, ...invalidFields }])).toBeNull();
  });
});
