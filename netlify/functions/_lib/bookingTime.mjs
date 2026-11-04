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
