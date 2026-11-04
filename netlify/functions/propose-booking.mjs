/**
 * POST /.netlify/functions/propose-booking
 *
 * Permette a un amministratore autorizzato
 * di salvare una proposta alternativa.
 *
 * La prenotazione originale resta invariata.
 * La proposta viene salvata come bozza.
 * Nessuna email viene inviata.
 * Nessun appuntamento viene confermato.
 */

// ==========================================
// CONFIGURAZIONE
// ==========================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

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
// CONTROLLO WEEKEND
// ==========================================

const isWeekend = (date) => {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();

  return day === 0 || day === 6;
};

// ==========================================
// CONVERSIONE ORARI
// ==========================================

const toMinutes = (time) => {
  if (typeof time !== "string") {
    return NaN;
  }

  const match = time.match(DATABASE_TIME_REGEX);

  if (!match) {
    return NaN;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
};

// ==========================================
// VALIDAZIONE SLOT
// ==========================================

const isValidSlot = (date, time, duration) => {
  if (
    !isValidDate(date) ||
    !TIME_REGEX.test(time) ||
    !Number.isInteger(duration) ||
    duration <= 0
  ) {
    return false;
  }

  // Lo studio è chiuso nel weekend.
  if (isWeekend(date)) {
    return false;
  }

  const start = toMinutes(time);
  const end = start + duration;

  // Appuntamenti allineati agli slot
  // del calendario pubblico.
  return WORKING_PERIODS.some(
    ([periodStart, periodEnd]) =>
      start >= periodStart &&
      end <= periodEnd &&
      (start - periodStart) % duration === 0,
  );
};

// ==========================================
// ORARIO CORRENTE EUROPE/ROME
// ==========================================

const getRomeNow = () => {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

// ==========================================
// VERIFICA DATA FUTURA
// ==========================================

const isFutureSlot = (date, time) => {
  const now = getRomeNow();

  if (date > now.date) {
    return true;
  }

  if (date < now.date) {
    return false;
  }

  return toMinutes(time) > now.minutes;
};

// ==========================================
// BUFFER VIAGGIO
// ==========================================

const getTravelBuffer = (type) => {
  return type === "azienda" ? TRAVEL_BUFFER_MINUTES : 0;
};

// ==========================================
// INTERVALLO EFFETTIVO
// ==========================================

const getEffectiveInterval = ({ time, duration, type }) => {
  if (!Object.hasOwn(DURATIONS, type)) {
    throw new Error("Modalità appuntamento non valida.");
  }

  const start = toMinutes(time);
  const minutes = Number(duration);

  if (!Number.isFinite(start) || !Number.isInteger(minutes) || minutes <= 0) {
    throw new Error("Dati temporali non validi.");
  }

  const buffer = getTravelBuffer(type);

  return {
    start: start - buffer,
    end: start + minutes + buffer,
  };
};

// ==========================================
// SOVRAPPOSIZIONI
// ==========================================

const intervalsOverlap = (first, second) => {
  return first.start < second.end && first.end > second.start;
};

// ==========================================
// RICHIESTE SUPABASE
// ==========================================

const supabaseRequest = async (url, serviceKey, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(10000),
  });

// ==========================================
// FUNZIONE PRINCIPALE
// ==========================================

export default async function handler(request) {
  // ========================================
  // 1. CONTROLLO METODO HTTP
  // ========================================

  if (request.method !== "POST") {
    return json(
      {
        success: false,
        message: "Metodo non consentito.",
      },
      405,
    );
  }

  // ========================================
  // 2. CONFIGURAZIONE SUPABASE
  // ========================================

  const supabaseUrl = process.env.SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Configurazione Supabase mancante.");

    return json(
      {
        success: false,
        message: "Servizio temporaneamente non disponibile.",
      },
      503,
    );
  }

  // ========================================
  // 3. TOKEN AMMINISTRATORE
  // ========================================

  const authorization = request.headers.get("authorization") ?? "";

  const token = authorization.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) {
    return json(
      {
        success: false,
        message: "Accesso non autorizzato.",
      },
      401,
    );
  }

  try {
    // ======================================
    // 4. VERIFICA IDENTITÀ
    // ======================================

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!userResponse.ok) {
      return json(
        {
          success: false,
          message: "Sessione non valida.",
        },
        401,
      );
    }

    const user = await userResponse.json();

    if (!user?.id) {
      return json(
        {
          success: false,
          message: "Utente non valido.",
        },
        401,
      );
    }

    // ======================================
    // 5. CONTROLLO AMMINISTRATORE
    // ======================================

    const adminUrl = new URL(`${supabaseUrl}/rest/v1/admin_users`);

    adminUrl.searchParams.set("select", "user_id");

    adminUrl.searchParams.set("user_id", `eq.${user.id}`);

    adminUrl.searchParams.set("limit", "1");

    const adminResponse = await supabaseRequest(adminUrl, serviceKey);

    if (!adminResponse.ok) {
      console.error("Errore verifica amministratore:", adminResponse.status);

      return json(
        {
          success: false,
          message: "Impossibile verificare i permessi.",
        },
        502,
      );
    }

    const adminRows = await adminResponse.json();

    if (!Array.isArray(adminRows)) {
      return json(
        {
          success: false,
          message: "Risposta verifica amministratore non valida.",
        },
        502,
      );
    }

    if (adminRows.length === 0) {
      return json(
        {
          success: false,
          message: "Permessi insufficienti.",
        },
        403,
      );
    }

    // ======================================
    // 6. VALIDAZIONE INPUT
    // ======================================

    const body = await request.json().catch(() => null);

    const bookingId = body?.bookingId;
    const proposedDate = body?.proposedDate;
    const proposedTime = body?.proposedTime;
    const proposalNote = body?.proposalNote ?? "";

    if (
      !Number.isSafeInteger(bookingId) ||
      bookingId <= 0 ||
      !isValidDate(proposedDate) ||
      typeof proposedTime !== "string" ||
      !TIME_REGEX.test(proposedTime) ||
      typeof proposalNote !== "string" ||
      proposalNote.length > 1000
    ) {
      return json(
        {
          success: false,
          message: "Dati proposta non validi.",
        },
        400,
      );
    }

    // ======================================
    // 7. RECUPERO PRENOTAZIONE
    // ======================================

    const bookingUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);

    bookingUrl.searchParams.set(
      "select",
      [
        "id",
        "status",
        "appointment_type",
        "appointment_date",
        "appointment_time",
        "proposal_status",
      ].join(","),
    );

    bookingUrl.searchParams.set("id", `eq.${bookingId}`);

    bookingUrl.searchParams.set("limit", "1");

    const bookingResponse = await supabaseRequest(bookingUrl, serviceKey);

    if (!bookingResponse.ok) {
      return json(
        {
          success: false,
          message: "Impossibile leggere la prenotazione.",
        },
        502,
      );
    }

    const bookingRows = await bookingResponse.json();

    if (!Array.isArray(bookingRows)) {
      return json(
        {
          success: false,
          message: "Risposta prenotazione non valida.",
        },
        502,
      );
    }

    const booking = bookingRows[0];

    if (!booking) {
      return json(
        {
          success: false,
          message: "Prenotazione non trovata.",
        },
        404,
      );
    }

    // ======================================
    // 8. STATO DELLA PRENOTAZIONE
    // ======================================

    if (booking.status !== "pending") {
      return json(
        {
          success: false,
          message: "La prenotazione non è più in attesa.",
        },
        409,
      );
    }

    if (
      booking.proposal_status === "sent" ||
      booking.proposal_status === "accepted"
    ) {
      return json(
        {
          success: false,
          message: "Esiste già una proposta inviata al cliente.",
        },
        409,
      );
    }

    // ======================================
    // 9. VALIDAZIONE APPUNTAMENTO
    // ======================================

    const duration = DURATIONS[booking.appointment_type];

    if (!duration || !isValidSlot(proposedDate, proposedTime, duration)) {
      return json(
        {
          success: false,
          message: "Data o orario non disponibile.",
        },
        400,
      );
    }

    if (!isFutureSlot(proposedDate, proposedTime)) {
      return json(
        {
          success: false,
          message: "Seleziona una data e un orario futuri.",
        },
        400,
      );
    }

    // ======================================
    // 10. PROPOSTA DIVERSA DALL'ORIGINALE
    // ======================================

    const originalTime = booking.appointment_time?.slice(0, 5);

    if (
      proposedDate === booking.appointment_date &&
      proposedTime === originalTime
    ) {
      return json(
        {
          success: false,
          message: "Seleziona un orario diverso dall'originale.",
        },
        400,
      );
    }

    // ======================================
    // 11. RECUPERO APPUNTAMENTI CONFERMATI
    // ======================================

    const availabilityUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);

    availabilityUrl.searchParams.set(
      "select",
      ["appointment_time", "duration_minutes", "appointment_type"].join(","),
    );

    availabilityUrl.searchParams.set("appointment_date", `eq.${proposedDate}`);

    availabilityUrl.searchParams.set("status", "eq.confirmed");

    const availabilityResponse = await supabaseRequest(
      availabilityUrl,
      serviceKey,
    );

    if (!availabilityResponse.ok) {
      console.error(
        "Errore verifica disponibilità:",
        availabilityResponse.status,
      );

      return json(
        {
          success: false,
          message: "Impossibile verificare la disponibilità.",
        },
        502,
      );
    }

    const confirmedBookings = await availabilityResponse.json();

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
    // 12. INTERVALLO DELLA PROPOSTA
    // ======================================

    const proposedInterval = getEffectiveInterval({
      time: proposedTime,
      duration,
      type: booking.appointment_type,
    });

    // ======================================
    // 13. CONTROLLO SOVRAPPOSIZIONI
    // ======================================

    const hasConflict = confirmedBookings.some((confirmed) => {
      const confirmedInterval = getEffectiveInterval({
        time: confirmed.appointment_time,
        duration: confirmed.duration_minutes,
        type: confirmed.appointment_type,
      });

      return intervalsOverlap(proposedInterval, confirmedInterval);
    });

    if (hasConflict) {
      return json(
        {
          success: false,
          message:
            "Questo orario è già occupato o non rispetta i tempi di viaggio. Selezionane un altro.",
        },
        409,
      );
    }

    // ======================================
    // 14. SALVATAGGIO DELLA BOZZA
    // ======================================

    const updateUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);

    updateUrl.searchParams.set("id", `eq.${bookingId}`);

    // Evita di modificare una richiesta
    // che nel frattempo è stata approvata
    // oppure rifiutata.
    updateUrl.searchParams.set("status", "eq.pending");

    // Restituiamo soltanto i campi necessari,
    // non tutti i dati personali del cliente.
    updateUrl.searchParams.set(
      "select",
      [
        "id",
        "status",
        "proposed_date",
        "proposed_time",
        "proposal_status",
      ].join(","),
    );

    const updateResponse = await supabaseRequest(updateUrl, serviceKey, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        proposal_note: proposalNote.trim() || null,
        proposal_status: "draft",
        proposal_sent_at: null,
      }),
    });

    if (!updateResponse.ok) {
      console.error("Errore salvataggio proposta:", updateResponse.status);

      return json(
        {
          success: false,
          message: "Impossibile salvare la proposta.",
        },
        502,
      );
    }

    const updatedRows = await updateResponse.json();

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return json(
        {
          success: false,
          message: "La prenotazione è stata modificata. Aggiorna l'elenco.",
        },
        409,
      );
    }

    // ======================================
    // 15. RISPOSTA POSITIVA
    // ======================================

    return json({
      success: true,
      message: "Bozza della proposta salvata correttamente.",
      booking: updatedRows[0],
    });
  } catch (error) {
    console.error(
      "Errore proposta appuntamento:",
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
