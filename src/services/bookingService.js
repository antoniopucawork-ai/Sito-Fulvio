// ========================================
// BOOKING SERVICE - FULVIO MARTELLO
// ========================================

// Endpoint della Netlify Function.
// Nessuna chiave segreta deve essere inserita nel frontend.
const BOOKING_ENDPOINT = "/.netlify/functions/create-booking";

// ========================================
// INVIO RICHIESTA DI APPUNTAMENTO
// ========================================

export const createBookingRequest = async (bookingData) => {
  let response;

  try {
    response = await fetch(BOOKING_ENDPOINT, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(bookingData),
    });
  } catch {
    throw new Error("Impossibile contattare il servizio di prenotazione.");
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Il server ha restituito una risposta non valida.");
  }

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.message || "Non è stato possibile inviare la richiesta.",
    );
  }

  // Il server conferma soltanto la ricezione.
  // L'appuntamento rimane in attesa di approvazione.
  return {
    success: true,
    bookingId: result.bookingId,
    status: "pending",
    message:
      result.message || "Richiesta ricevuta. Attendi la conferma dello studio.",
  };
};
