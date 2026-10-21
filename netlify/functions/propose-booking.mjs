const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const DURATIONS = {
  video: 30,
  studio: 60,
  azienda: 60,
};

const isValidDate = (value) => {
  if (typeof value !== "string" || !DATE_REGEX.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidSlot = (date, time, duration) => {
  if (!isValidDate(date) || !TIME_REGEX.test(time)) return false;

  const day = new Date(`${date}T12:00:00Z`).getUTCDay();

  // Studio aperto dal lunedì al venerdì.
  if (day === 0 || day === 6) return false;

  const start = toMinutes(time);
  const end = start + duration;

  const morning = start >= 540 && end <= 780;
  const afternoon = start >= 870 && end <= 1110;

  if (!morning && !afternoon) return false;

  // Gli appuntamenti seguono gli intervalli previsti dal calendario.
  const periodStart = morning ? 540 : 870;

  return (start - periodStart) % duration === 0;
};

const supabaseRequest = async (url, serviceKey, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(10000),
  });
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ success: false, message: "Metodo non consentito." }, 405);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Configurazione Supabase mancante.");

    return json(
      { success: false, message: "Servizio temporaneamente non disponibile." },
      503,
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return json({ success: false, message: "Accesso non autorizzato." }, 401);
  }

  try {
    // Verifica l'identità tramite Supabase Auth.
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!userResponse.ok) {
      return json({ success: false, message: "Sessione non valida." }, 401);
    }

    const user = await userResponse.json();

    if (!user?.id) {
      return json({ success: false, message: "Utente non valido." }, 401);
    }

    // Verifica che l'utente appartenga agli amministratori autorizzati.
    const adminUrl = new URL(`${supabaseUrl}/rest/v1/admin_users`);
    adminUrl.searchParams.set("select", "user_id");
    adminUrl.searchParams.set("user_id", `eq.${user.id}`);
    adminUrl.searchParams.set("limit", "1");

    const adminResponse = await supabaseRequest(adminUrl, serviceKey);

    if (!adminResponse.ok) {
      const errorDetails = await adminResponse.text();

      console.error("ERRORE VERIFICA ADMIN:", {
        status: adminResponse.status,
        details: errorDetails,
      });

      return json(
        {
          success: false,
          message: "Impossibile verificare i permessi.",
        },
        502,
      );
    }

    const admins = await adminResponse.json();

    if (!Array.isArray(admins) || admins.length === 0) {
      return json({ success: false, message: "Permessi insufficienti." }, 403);
    }

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
        { success: false, message: "Dati proposta non validi." },
        400,
      );
    }

    // Recupera la prenotazione originale.
    const bookingUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);
    bookingUrl.searchParams.set(
      "select",
      "id,status,appointment_type,appointment_date,appointment_time,proposal_status",
    );
    bookingUrl.searchParams.set("id", `eq.${bookingId}`);
    bookingUrl.searchParams.set("limit", "1");

    const bookingResponse = await supabaseRequest(bookingUrl, serviceKey);

    if (!bookingResponse.ok) {
      return json(
        { success: false, message: "Impossibile leggere la prenotazione." },
        502,
      );
    }

    const bookingRows = await bookingResponse.json();
    const booking = bookingRows?.[0];

    if (!booking) {
      return json(
        { success: false, message: "Prenotazione non trovata." },
        404,
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

    const duration = DURATIONS[booking.appointment_type];
    const now = new Date();

    const romeNow = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);

    const parts = Object.fromEntries(
      romeNow.map(({ type, value }) => [type, value]),
    );

    const todayRome = `${parts.year}-${parts.month}-${parts.day}`;
    const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);

    if (
      proposedDate < todayRome ||
      (proposedDate === todayRome && toMinutes(proposedTime) <= currentMinutes)
    ) {
      return json(
        {
          success: false,
          message: "Seleziona una data e un orario futuri.",
        },
        400,
      );
    }

    if (!duration || !isValidSlot(proposedDate, proposedTime, duration)) {
      return json(
        { success: false, message: "Data o orario non disponibile." },
        400,
      );
    }

    // La proposta deve essere diversa dall'appuntamento richiesto.
    if (
      proposedDate === booking.appointment_date &&
      proposedTime === booking.appointment_time.slice(0, 5)
    ) {
      return json(
        {
          success: false,
          message: "Seleziona un orario diverso dall'originale.",
        },
        400,
      );
    }

    // Verifica che lo slot non si sovrapponga a prenotazioni confermate.
    const availabilityUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);
    availabilityUrl.searchParams.set(
      "select",
      "appointment_time,duration_minutes",
    );
    availabilityUrl.searchParams.set("appointment_date", `eq.${proposedDate}`);
    availabilityUrl.searchParams.set("status", "eq.confirmed");

    const availabilityResponse = await supabaseRequest(
      availabilityUrl,
      serviceKey,
    );

    if (!availabilityResponse.ok) {
      return json(
        { success: false, message: "Impossibile verificare la disponibilità." },
        502,
      );
    }

    const confirmedBookings = await availabilityResponse.json();

    if (!Array.isArray(confirmedBookings)) {
      return json(
        { success: false, message: "Risposta disponibilità non valida." },
        502,
      );
    }

    const proposedStart = toMinutes(proposedTime);
    const proposedEnd = proposedStart + duration;

    const hasConflict = confirmedBookings.some((confirmed) => {
      const start = toMinutes(confirmed.appointment_time);
      const end = start + Number(confirmed.duration_minutes);

      return proposedStart < end && proposedEnd > start;
    });

    if (hasConflict) {
      return json(
        {
          success: false,
          message: "Questo orario è già occupato. Selezionane un altro.",
        },
        409,
      );
    }

    // Salva esclusivamente una bozza: nessuna email viene inviata.
    const updateUrl = new URL(`${supabaseUrl}/rest/v1/bookings`);
    updateUrl.searchParams.set("id", `eq.${bookingId}`);
    updateUrl.searchParams.set("status", "eq.pending");

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
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      console.error("Errore salvataggio proposta:", updateResponse.status);

      return json(
        { success: false, message: "Impossibile salvare la proposta." },
        502,
      );
    }

    const updatedRows = await updateResponse.json();

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return json(
        { success: false, message: "La prenotazione è stata modificata." },
        409,
      );
    }

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
      { success: false, message: "Servizio temporaneamente non disponibile." },
      502,
    );
  }
}
