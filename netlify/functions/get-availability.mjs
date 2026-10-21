const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DURATIONS = {
  video: 30,
  studio: 60,
  azienda: 60,
};

const isValidDate = (value) => {
  if (!DATE_REGEX.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const generateSlots = (duration) => {
  const periods = [
    [9 * 60, 13 * 60],
    [14 * 60 + 30, 18 * 60 + 30],
  ];

  return periods.flatMap(([start, end]) => {
    const slots = [];

    for (let current = start; current + duration <= end; current += duration) {
      const hours = String(Math.floor(current / 60)).padStart(2, "0");
      const minutes = String(current % 60).padStart(2, "0");

      slots.push(`${hours}:${minutes}`);
    }

    return slots;
  });
};

export default async function handler(request) {
  if (request.method !== "GET") {
    return json({ success: false, message: "Metodo non consentito." }, 405);
  }

  const url = new URL(request.url);

  const date = url.searchParams.get("date");
  const type = url.searchParams.get("type");

  if (!date || !isValidDate(date) || !Object.hasOwn(DURATIONS, type)) {
    return json({ success: false, message: "Parametri non validi." }, 400);
  }

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

  try {
    const endpoint = new URL(`${supabaseUrl}/rest/v1/bookings`);

    endpoint.searchParams.set("select", "appointment_time,duration_minutes");
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

    const duration = DURATIONS[type];

    const occupiedIntervals = confirmedBookings.map((booking) => {
      const start = timeToMinutes(booking.appointment_time);

      return {
        start,
        end: start + booking.duration_minutes,
      };
    });

    const slots = generateSlots(duration);

    const availableSlots = slots.filter((slot) => {
      const start = timeToMinutes(slot);
      const end = start + duration;

      return !occupiedIntervals.some(
        (occupied) => start < occupied.end && end > occupied.start,
      );
    });

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
