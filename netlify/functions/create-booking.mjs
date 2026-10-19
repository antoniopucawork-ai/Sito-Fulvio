import { validateBooking } from "./_lib/bookingValidation.mjs";

export default async function handler(request) {
  // Accettiamo soltanto richieste POST.
  if (request.method !== "POST") {
    return Response.json(
      { success: false, message: "Metodo non consentito." },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  // Limite iniziale alla dimensione della richiesta.
  const maxBodySize = 10_000;

  const contentLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > maxBodySize) {
    return Response.json(
      { success: false, message: "Richiesta troppo grande." },
      { status: 413 },
    );
  }

  let payload;

  try {
    const body = await request.text();

    if (body.length > maxBodySize) {
      return Response.json(
        { success: false, message: "Richiesta troppo grande." },
        { status: 413 },
      );
    }

    payload = JSON.parse(body);
  } catch {
    return Response.json(
      { success: false, message: "Dati JSON non validi." },
      { status: 400 },
    );
  }

  const validation = validateBooking(payload);

  if (!validation.valid) {
    return Response.json(
      {
        success: false,
        message: "Controlla i dati inseriti.",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  // Il salvataggio verrà implementato successivamente.
  // Non restituiamo un falso messaggio di successo.
  return Response.json(
    {
      success: false,
      message: "Il sistema di prenotazione non è ancora attivo.",
    },
    { status: 503 },
  );
}
