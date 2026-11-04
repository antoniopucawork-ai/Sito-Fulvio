// Data e ora correnti dello studio, nel fuso italiano.
export const getItalianDateTime = () => {
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
export const isFutureAppointment = (date, time, now = getItalianDateTime()) => {

  if (date > now.date) return true;
  if (date < now.date) return false;

  return time > now.time;
};

// Gli orari PostgreSQL hanno al massimo sei cifre frazionarie.
// I microsecondi di un giorno sono interi esatti anche come Number JavaScript.
const DATABASE_TIME_REGEX =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,6}))?)?$/;

export const MICROSECONDS_PER_MINUTE = 60_000_000;

export const timeToMicroseconds = (value) => {
  const match =
    typeof value === "string" ? value.match(DATABASE_TIME_REGEX) : null;

  if (!match) return NaN;

  const seconds =
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0);
  const fraction = Number((match[4] ?? "").padEnd(6, "0"));

  return seconds * 1_000_000 + fraction;
};

// Il chiamante valida durata e buffer in minuti; l'intervallo è in microsecondi.
export const getTimeInterval = (startMicroseconds, durationMinutes, bufferMinutes = 0) => {
  const buffer = bufferMinutes * MICROSECONDS_PER_MINUTE;

  return {
    start: startMicroseconds - buffer,
    end: startMicroseconds + durationMinutes * MICROSECONDS_PER_MINUTE + buffer,
  };
};

// Intervalli [inizio, fine): il contatto esatto non è una sovrapposizione.
export const intervalsOverlap = (first, second) =>
  first.start < second.end && first.end > second.start;
