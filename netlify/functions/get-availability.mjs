import { getItalianDateTime, isFutureAppointment } from "./_lib/bookingTime.mjs";

/**
 * GET /.netlify/functions/get-availability
 *
 * Restituisce gli orari disponibili per una data
 * e una modalità di appuntamento.
 *
 * Regole:
 * - Apertura dal lunedì al venerdì.
 * - Mattina: 09:00 - 13:00.
 * - Pomeriggio: 14:30 - 18:30.
 * - Videochiamata: 30 minuti.
 * - Studio: 60 minuti.
 * - Azienda: 60 minuti + 90 minuti
 *   di viaggio prima e dopo.
 * - Soltanto le prenotazioni confermate
 *   occupano il calendario.
 */

// ==========================================
// CONFIGURAZIONE
// ==========================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DATABASE_TIME_REGEX =
  /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

const DURATIONS = {
  video: 30,
  studio: 60,
  azienda: 60,
};

const TRAVEL_BUFFER_MINUTES = 90;

const WORKING_PERIODS = [
  [9 * 60, 13 * 60],
  [14 * 60 + 30, 18 * 60 + 30],
];

// ==========================================
// RISPOSTE HTTP
// ==========================================

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

// ==========================================
// VALIDAZIONE DATE
// ==========================================

const isValidDate = (value) => {
  if (typeof value !== "string" || !DATE_REGEX.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

// ==========================================
// GIORNI LAVORATIVI
// ==========================================

const isWeekend = (date) => {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();

  return day === 0 || day === 6;
};

// ==========================================
// CONVERSIONE ORARI
// ==========================================

const timeToMinutes = (value) => {
  const match =
    typeof value === "string" ? value.match(DATABASE_TIME_REGEX) : null;

  if (!match) return NaN;

  return Number(match[1]) * 60 + Number(match[2]);
};

const minutesToTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");

  const remainingMinutes = String(minutes % 60).padStart(2, "0");

  return `${hours}:${remainingMinutes}`;
};

// ==========================================
// GENERAZIONE SLOT
// ==========================================

const generateSlots = (duration) => {
  const slots = [];

  for (const [periodStart, periodEnd] of WORKING_PERIODS) {
    for (
      let current = periodStart;
      current + duration <= periodEnd;
      current += duration
    ) {
      slots.push(minutesToTime(current));
    }
  }

  return slots;
};

// ==========================================
// BUFFER VIAGGIO
// ==========================================

const getTravelBuffer = (appointmentType) => {
  return appointmentType === "azienda" ? TRAVEL_BUFFER_MINUTES : 0;
};

// ==========================================
// INTERVALLI OCCUPATI
// ==========================================

const getOccupiedInterval = (booking) => {
  const start = timeToMinutes(booking.appointment_time);

  const duration = Number(booking.duration_minutes);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    !Object.hasOwn(DURATIONS, booking.appointment_type)
  ) {
    throw new Error("Dati prenotazione confermata non validi.");
  }

  const buffer = getTravelBuffer(booking.appointment_type);

  return {
    start: start - buffer,
    end: start + duration + buffer,
  };
};

// ==========================================
// INTERVALLO RICHIESTO
// ==========================================

const getRequestedInterval = (time, type, duration) => {
  const start = timeToMinutes(time);
  const buffer = getTravelBuffer(type);

  return {
    start: start - buffer,
    end: start + duration + buffer,
  };
};

// ==========================================
// CONTROLLO SOVRAPPOSIZIONI
// ==========================================

const intervalsOverlap = (first, second) => {
  return first.start < second.end && first.end > second.start;
};

// ==========================================
// FUNZIONE PRINCIPALE
// ==========================================

export default async function handler(request) {
  // ========================================
  // 1. METODO HTTP
  // ========================================

  if (request.method !== "GET") {
    return json(
      {
        success: false,
        message: "Metodo non consentito.",
      },
      405,
    );
  }

  // ========================================
  // 2. PARAMETRI
  // ========================================

  const url = new URL(request.url);

  const date = url.searchParams.get("date");
  const type = url.searchParams.get("type");

  if (!isValidDate(date) || !Object.hasOwn(DURATIONS, type)) {
    return json(
      {
        success: false,
        message: "Parametri non validi.",
      },
      400,
    );
  }

  // ========================================
  // 3. BLOCCO WEEKEND
  // ========================================

  if (isWeekend(date)) {
    return json(
      {
        success: false,
        message: "Lo studio è chiuso il sabato e la domenica.",
        availableSlots: [],
      },
      400,
    );
  }

  // ========================================
  // 4. CONFIGURAZIONE SUPABASE
  // ========================================

  const supabaseUrl = process.env.SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Configurazione Supabase mancante.");

    return json(
      {
        success: false,
        message: "Servizio disponibilità non disponibile.",
      },
      503,
    );
  }

  // ========================================
  // 5. RECUPERO PRENOTAZIONI
  // ========================================

  try {
    const endpoint = new URL(`${supabaseUrl}/rest/v1/bookings`);

    endpoint.searchParams.set(
      "select",
      "appointment_time,duration_minutes,appointment_type",
    );

    endpoint.searchParams.set("appointment_date", `eq.${date}`);

    endpoint.searchParams.set("status", "eq.confirmed");

    const response = await fetch(endpoint, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("Errore recupero disponibilità:", response.status);

      return json(
        {
          success: false,
          message: "Impossibile verificare gli orari disponibili.",
        },
        502,
      );
    }

    const confirmedBookings = await response.json();

    if (!Array.isArray(confirmedBookings)) {
      return json(
        {
          success: false,
          message: "Risposta disponibilità non valida.",
        },
        502,
      );
    }

    // ======================================
    // 6. DURATA APPUNTAMENTO RICHIESTO
    // ======================================

    const duration = DURATIONS[type];

    // ======================================
    // 7. INTERVALLI GIÀ OCCUPATI
    // ======================================

    const occupiedIntervals = confirmedBookings.map(getOccupiedInterval);

    // ======================================
    // 8. GENERAZIONE ORARI
    // ======================================

    const slots = generateSlots(duration);

    // ======================================
    // 9. FILTRO CONFLITTI
    // ======================================

    const now = getItalianDateTime();

    const availableSlots = slots.filter((slot) => {
      if (!isFutureAppointment(date, slot, now)) return false;

      const requestedInterval = getRequestedInterval(slot, type, duration);

      const hasConflict = occupiedIntervals.some((occupiedInterval) =>
        intervalsOverlap(requestedInterval, occupiedInterval),
      );

      return !hasConflict;
    });

    // ======================================
    // 10. RISPOSTA
    // ======================================

    return json({
      success: true,
      date,
      type,
      availableSlots,
    });
  } catch (error) {
    console.error(
      "Errore verifica disponibilità:",
      error instanceof Error ? error.message : "Errore sconosciuto",
    );

    return json(
      {
        success: false,
        message: "Servizio temporaneamente non disponibile.",
      },
      502,
    );
  }
}
