// ========================================
// BOOKING VALIDATION - FULVIO MARTELLO
// ========================================

// Configurazione lato server.
// Non ci fidiamo delle durate inviate dal frontend.

const APPOINTMENT_TYPES = {
  video: 30,
  studio: 60,
  azienda: 60,
};

const OFFICE_PERIODS = [
  { start: 9 * 60, end: 13 * 60 },
  { start: 14 * 60 + 30, end: 18 * 60 + 30 },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
// Data e ora correnti dello studio, nel fuso italiano.
const getItalianDateTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
};

// Impedisce di richiedere appuntamenti nel passato.
const isFutureAppointment = (date, time) => {
  const now = getItalianDateTime();

  if (date > now.date) return true;
  if (date < now.date) return false;

  return time > now.time;
};

// Controlla che l'orario rispetti gli intervalli
// effettivamente proposti dal calendario.
const isValidTimeSlot = (time, duration) => {
  const startMinutes = timeToMinutes(time);

  return OFFICE_PERIODS.some((period) => {
    for (
      let slot = period.start;
      slot + duration <= period.end;
      slot += duration
    ) {
      if (slot === startMinutes) return true;
    }

    return false;
  });
};

const cleanText = (value, maxLength) => {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const isValidDate = (value) => {
  if (!DATE_REGEX.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const isWorkingDay = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  const dayOfWeek = date.getUTCDay();

  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

const isWithinOfficeHours = (time, duration) => {
  const startMinutes = timeToMinutes(time);
  const endMinutes = startMinutes + duration;

  return OFFICE_PERIODS.some(
    (period) => startMinutes >= period.start && endMinutes <= period.end,
  );
};

export const validateBooking = (payload) => {
  const errors = {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: { request: "Richiesta non valida." },
      data: null,
    };
  }

  const firstName = cleanText(payload.firstName, 80);
  const lastName = cleanText(payload.lastName, 80);
  const email = cleanText(payload.email, 254).toLowerCase();
  const phone = cleanText(payload.phone, 30);
  const companyName = cleanText(payload.companyName, 120);
  const companyAddress = cleanText(payload.companyAddress, 250);
  const notes = cleanText(payload.notes, 500);

  const appointmentType = payload.appointmentType;
  const date = payload.date;
  const time = payload.time;

  if (!firstName) errors.firstName = "Inserisci il nome.";
  if (!lastName) errors.lastName = "Inserisci il cognome.";

  if (!EMAIL_REGEX.test(email)) {
    errors.email = "Inserisci un indirizzo email valido.";
  }

  if (!/^\+?[\d\s().-]{6,30}$/.test(phone)) {
    errors.phone = "Inserisci un numero di telefono valido.";
  }

  if (!Object.hasOwn(APPOINTMENT_TYPES, appointmentType)) {
    errors.appointmentType = "Modalità di appuntamento non valida.";
  }

  if (appointmentType === "azienda") {
    if (!companyName) {
      errors.companyName = "Inserisci il nome dell'azienda.";
    }

    if (!companyAddress) {
      errors.companyAddress = "Inserisci l'indirizzo dell'azienda.";
    }
  }

  if (typeof date !== "string" || !isValidDate(date)) {
    errors.date = "Data non valida.";
  } else if (!isWorkingDay(date)) {
    errors.date = "Gli appuntamenti sono disponibili dal lunedì al venerdì.";
  }

  if (typeof time !== "string" || !TIME_REGEX.test(time)) {
    errors.time = "Orario non valido.";
  }

  if (!errors.appointmentType && !errors.time) {
    const duration = APPOINTMENT_TYPES[appointmentType];

    if (!isWithinOfficeHours(time, duration)) {
      errors.time = "L'orario non rientra negli orari dello studio.";
    } else if (!isValidTimeSlot(time, duration)) {
      errors.time = "L'orario selezionato non è disponibile.";
    }
  }

  // Controllo delle richieste nel passato.
  if (!errors.date && !errors.time) {
    if (!isFutureAppointment(date, time)) {
      errors.date = "Non puoi richiedere un appuntamento nel passato.";
    }
  }

  if (payload.privacyAccepted !== true) {
    errors.privacyAccepted =
      "Devi dichiarare di aver letto l'informativa privacy.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors,
      data: null,
    };
  }

  return {
    valid: true,
    errors: {},
    data: {
      firstName,
      lastName,
      email,
      phone,
      companyName: appointmentType === "azienda" ? companyName : "",
      companyAddress: appointmentType === "azienda" ? companyAddress : "",
      notes,
      appointmentType,
      date,
      time,
      duration: APPOINTMENT_TYPES[appointmentType],

      // Tutte le richieste nascono in attesa.
      status: "pending",
    },
  };
};
