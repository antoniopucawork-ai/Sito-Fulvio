import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ========================================
// CONFIGURAZIONE
// ========================================

const MAX_BODY_SIZE = 10_000;

const APPOINTMENT_TYPES = ["video", "studio", "azienda"];

const json = (data: unknown, status = 200) => {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
};

// ========================================
// FUNZIONE PRINCIPALE
// ========================================

Deno.serve(async (request: Request) => {
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
  // 2. AUTENTICAZIONE TRA SERVER
  // ========================================

  const expectedSecret = Deno.env.get("BOOKING_INTERNAL_SECRET");

  const receivedSecret = request.headers.get("x-booking-secret");

  if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
    return json(
      {
        success: false,
        message: "Accesso non autorizzato.",
      },
      401,
    );
  }

  // ========================================
  // 3. CONTROLLO DIMENSIONE RICHIESTA
  // ========================================

  const contentLengthHeader = request.headers.get("content-length");

  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);

    if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_SIZE) {
      return json(
        {
          success: false,
          message: "Richiesta troppo grande.",
        },
        413,
      );
    }
  }

  // ========================================
  // 4. LETTURA JSON
  // ========================================

  let payload: Record<string, unknown>;

  try {
    const body = await request.text();

    const bodySize = new TextEncoder().encode(body).length;

    if (bodySize > MAX_BODY_SIZE) {
      return json(
        {
          success: false,
          message: "Richiesta troppo grande.",
        },
        413,
      );
    }

    const parsed: unknown = JSON.parse(body);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(
        {
          success: false,
          message: "Richiesta non valida.",
        },
        400,
      );
    }

    payload = parsed as Record<string, unknown>;
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
  // 5. VALIDAZIONE DATI
  // ========================================

  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "appointmentType",
    "date",
    "time",
  ];

  for (const field of requiredFields) {
    const value = payload[field];

    if (typeof value !== "string" || value.trim() === "") {
      return json(
        {
          success: false,
          message: `Campo obbligatorio non valido: ${field}.`,
        },
        400,
      );
    }
  }

  const appointmentType = payload.appointmentType as string;

  if (!APPOINTMENT_TYPES.includes(appointmentType)) {
    return json(
      {
        success: false,
        message: "Modalità di appuntamento non valida.",
      },
      400,
    );
  }

  // Per gli appuntamenti in azienda
  // servono anche nome e indirizzo.

  if (appointmentType === "azienda") {
    if (
      typeof payload.companyName !== "string" ||
      !payload.companyName.trim() ||
      typeof payload.companyAddress !== "string" ||
      !payload.companyAddress.trim()
    ) {
      return json(
        {
          success: false,
          message: "Inserisci nome e indirizzo dell'azienda.",
        },
        400,
      );
    }
  }

  // ========================================
  // 6. CONTROLLO PRIVACY
  // ========================================

  if (payload.privacyAccepted !== true) {
    return json(
      {
        success: false,
        message: "Devi dichiarare di aver letto l'informativa privacy.",
      },
      400,
    );
  }

  // ========================================
  // 7. CONFIGURAZIONE SUPABASE
  // ========================================

  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  const supabaseSecretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseSecretKey) {
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
  // 8. CONNESSIONE AL DATABASE
  // ========================================

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // ========================================
  // 9. PREPARAZIONE DATI
  // ========================================

  const firstName = (payload.firstName as string).trim();

  const lastName = (payload.lastName as string).trim();

  const email = (payload.email as string).trim().toLowerCase();

  const phone = (payload.phone as string).trim();

  const date = payload.date as string;

  const time = payload.time as string;

  const companyName =
    appointmentType === "azienda"
      ? (payload.companyName as string).trim()
      : null;

  const companyAddress =
    appointmentType === "azienda"
      ? (payload.companyAddress as string).trim()
      : null;

  const notes = typeof payload.notes === "string" ? payload.notes.trim() : null;

  // ========================================
  // 10. SALVATAGGIO NEL DATABASE
  // ========================================

  try {
    const { data, error } = await supabase.rpc("create_booking_request", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_phone: phone,
      p_appointment_type: appointmentType,
      p_appointment_date: date,
      p_appointment_time: time,
      p_company_name: companyName,
      p_company_address: companyAddress,
      p_notes: notes,
    });

    if (error) {
      console.error("Errore database:", error.code, error.message);

      return json(
        {
          success: false,
          message:
            "Impossibile registrare la richiesta. Controlla i dati inseriti.",
        },
        400,
      );
    }

    // ========================================
    // 11. RISPOSTA POSITIVA
    // ========================================

    return json(
      {
        success: true,
        bookingId: data,
        status: "pending",
        message:
          "Richiesta ricevuta. L'appuntamento sarà confermato soltanto dopo l'approvazione dello studio.",
      },
      201,
    );
  } catch (error) {
    console.error(
      "Errore durante la prenotazione:",
      error instanceof Error ? error.message : "Errore sconosciuto",
    );

    return json(
      {
        success: false,
        message: "Si è verificato un problema. Riprova più tardi.",
      },
      500,
    );
  }
});
