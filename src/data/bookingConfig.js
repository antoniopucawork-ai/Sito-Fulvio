export const bookingConfig = {
  title: "Richiedi un appuntamento",

  description:
    "Scegli la modalità, la data e l'orario che preferisci. Il Dott. Fulvio Martello valuterà personalmente la tua richiesta.",

  officeHours: {
    workingDays: [1, 2, 3, 4, 5],

    morning: {
      start: "09:00",
      end: "13:00",
    },

    afternoon: {
      start: "14:30",
      end: "18:30",
    },
  },

  appointmentTypes: [
    {
      id: "video",
      title: "Videochiamata",
      description: "Consulenza professionale a distanza.",
      duration: 30,
    },
    {
      id: "studio",
      title: "Appuntamento in studio",
      description: "Incontro presso lo studio di San Giorgio a Cremano.",
      duration: 60,
    },
    {
      id: "azienda",
      title: "Appuntamento presso la tua azienda",
      description:
        "Richiedi un incontro direttamente presso la sede della tua attività.",
      duration: 60,
      requiresAddress: true,
    },
  ],

  requiresApproval: true,

  confirmationMessage:
    "La tua richiesta è stata inviata correttamente. L'appuntamento sarà confermato soltanto dopo l'approvazione del Dott. Fulvio Martello.",
};
