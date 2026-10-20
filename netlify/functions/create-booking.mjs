import { validateBooking } from "./_lib/bookingValidation.mjs";

const MAX_BODY_SIZE = 10_000;

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

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
  // 2. CONTROLLO DIMENSIONE
  // ========================================

  const contentLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
    return json(
      {
        success: false,
        message: "Richiesta troppo grande.",
      },
      413,
    );
  }

  // ========================================
  // 3. LETTURA JSON
  // ========================================

  let payload;

  try {
    const body = await request.text();

    if (Buffer.byteLength(body, "utf8") > MAX_BODY_SIZE) {
      return json(
        {
          success: false,
          message: "Richiesta troppo grande.",
        },
        413,
      );
    }

    payload = JSON.parse(body);
  } catch {
    return json(
      {
        success: false,
        message: "Dati JSON non validi.",
      },
      400,
    );
  }

  // ========================================
  // 4. VALIDAZIONE PRENOTAZIONE
  // ========================================

  const validation = validateBooking(payload);

  if (!validation.valid) {
    return json(
      {
        success: false,
        message: "Controlla i dati inseriti.",
        errors: validation.errors,
      },
      400,
    );
  }

  // ========================================
  // 5. CONFIGURAZIONE SUPABASE
  // ========================================

  const supabaseUrl = process.env.SUPABASE_URL;

  const bookingSecret = process.env.BOOKING_INTERNAL_SECRET;

  if (!supabaseUrl || !bookingSecret) {
    console.error("Configurazione backend prenotazioni mancante.");

    return json(
      {
        success: false,
        message: "Il servizio di prenotazione non è disponibile.",
      },
      503,
    );
  }

  // ========================================
  // 6. COLLEGAMENTO EDGE FUNCTION
  // ========================================

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-booking`;

  const booking = validation.data;

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-booking-secret": bookingSecret,
      },

      body: JSON.stringify({
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone,
        appointmentType: booking.appointmentType,
        date: booking.date,
        time: booking.time,
        companyName: booking.companyName,
        companyAddress: booking.companyAddress,
        notes: booking.notes,
        privacyAccepted: true,
      }),

      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Errore Edge Function:", response.status);

      return json(
        {
          success: false,
          message: result.message || "Impossibile registrare la richiesta.",
        },
        response.status >= 500 ? 502 : 400,
      );
    }

    // ========================================
    // 7. RISPOSTA POSITIVA
    // ========================================

    return json(
      {
        success: true,
        bookingId: result.bookingId,
        status: "pending",
        message:
          "Richiesta ricevuta. Lo studio confermerà l'appuntamento dopo aver verificato la disponibilità.",
      },
      201,
    );
  } catch (error) {
    console.error(
      "Errore collegamento Supabase:",
      error instanceof Error ? error.message : "Errore sconosciuto",
    );

    return json(
      {
        success: false,
        message: "Servizio temporaneamente non disponibile. Riprova più tardi.",
      },
      502,
    );
  }
}
