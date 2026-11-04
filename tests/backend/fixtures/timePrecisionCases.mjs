// Risultati attesi indipendenti dal parser: intervalli [inizio, fine).
export const precisionCases = [
  ["30 secondi oltre il confine", "studio", "09:00:30", 60, "studio", "10:00", true],
  ["un microsecondo oltre il confine", "studio", "09:00:00.000001", 60, "video", "10:00", true],
  ["frazione di secondo oltre il confine", "studio", "09:00:00.999999", 60, "video", "10:00", true],
  ["un microsecondo prima del confine", "studio", "08:59:59.999999", 60, "video", "10:00", false],
  ["confine esatto senza secondi", "studio", "09:00", 60, "video", "10:00", false],
  ["confine esatto con frazione zero", "studio", "09:00:00.000000", 60, "video", "10:00", false],
  ["inizio dopo la fine richiesta", "video", "10:30:00.000001", 30, "video", "10:00", false],
  ["inizio un microsecondo prima della fine richiesta", "video", "10:29:59.999999", 30, "video", "10:00", true],
  ["buffer aziendale termina 30 secondi oltre il confine", "azienda", "09:00:30", 60, "video", "11:30", true],
  ["buffer aziendale termina al confine esatto", "azienda", "09:00:00", 60, "video", "11:30", false],
  ["buffer aziendale inizia al confine esatto", "azienda", "12:00:00", 60, "video", "10:00", false],
  ["buffer aziendale inizia un microsecondo prima del confine", "azienda", "11:59:59.999999", 60, "video", "10:00", true],
  ["buffer della richiesta aziendale sovrapposto di un microsecondo", "video", "08:00:00.000001", 30, "azienda", "10:00", true],
  ["buffer della richiesta aziendale al confine esatto", "video", "08:00:00", 30, "azienda", "10:00", false],
  ["due aziende: buffer sovrapposti di un microsecondo", "azienda", "10:30:00.000001", 60, "azienda", "14:30", true],
  ["due aziende: buffer al confine esatto", "azienda", "10:30:00", 60, "azienda", "14:30", false],
].map(([label, confirmedType, confirmedTime, duration, requestedType, requestedTime, conflict]) => ({
  label, confirmedType, confirmedTime, duration, requestedType, requestedTime, conflict,
}));

export const malformedDatabaseTimes = [
  "09:00:60", "09:00:00.", "09:00:00.1234567", "09:00:00Z",
  "9:00:00", "09::00", " 09:00:00", "09:00:00 ",
  "09:00:00\n", "09:00:00\r\n",
];
