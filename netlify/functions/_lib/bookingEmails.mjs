const RESEND_API_URL = "https://api.resend.com/emails";

export const sendNewBookingNotification = async (booking, bookingId) => {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.BOOKING_SENDER_EMAIL;
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL;

  if (!apiKey || !sender || !recipient) {
    console.error("Configurazione notifiche email incompleta.");
    return false;
  }

  const appointmentTypes = {
    video: "Videochiamata",
    studio: "Appuntamento in studio",
    azienda: "Appuntamento in azienda",
  };

  const appointmentType =
    appointmentTypes[booking.appointmentType] || booking.appointmentType;

  const emailText = `
Nuova richiesta di appuntamento

Cliente: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Telefono: ${booking.phone}

Modalità: ${appointmentType}
Data: ${booking.date}
Ora: ${booking.time}

ID prenotazione: ${bookingId}

La richiesta è in attesa di approvazione.

Accedi al gestionale per visualizzarla.
`.trim();

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `Nuova richiesta di appuntamento - ${booking.firstName} ${booking.lastName}`,
        text: emailText,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("Errore invio notifica Resend:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Errore notifica prenotazione:",
      error instanceof Error ? error.message : "Errore sconosciuto",
    );

    return false;
  }
};
