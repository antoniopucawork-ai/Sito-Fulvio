const BOOKING_ENDPOINT = "/.netlify/functions/create-booking";

const AVAILABILITY_ENDPOINT = "/.netlify/functions/get-availability";

const parseResponse = async (response) => {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Il server ha restituito una risposta non valida.");
  }

  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || "Impossibile completare la richiesta.");
  }

  return result;
};

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

  const result = await parseResponse(response);

  return {
    success: true,
    bookingId: result.bookingId,
    status: "pending",
    message:
      result.message || "Richiesta ricevuta. Attendi la conferma dello studio.",
  };
};

export const getBookingAvailability = async (date, appointmentType, signal) => {
  const params = new URLSearchParams({
    date,
    type: appointmentType,
  });

  let response;

  try {
    response = await fetch(`${AVAILABILITY_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;

    throw new Error("Impossibile contattare il servizio delle disponibilità.", {
      cause: error,
    });
  }

  const result = await parseResponse(response);

  if (!Array.isArray(result.availableSlots)) {
    throw new Error("Gli orari ricevuti non sono validi.");
  }

  return result.availableSlots;
};
