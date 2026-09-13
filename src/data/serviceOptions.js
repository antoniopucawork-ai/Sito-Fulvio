export const aziendaOptions = [
  {
    id: "personale",
    title: "Gestire dipendenti e personale",
    description: "Assunzioni, contratti, paghe e gestione del personale.",

    options: [
      {
        id: "assunzioni",
        title: "Assumere o modificare un contratto",
      },
      {
        id: "paghe",
        title: "Gestire paghe, presenze e contributi",
      },
      {
        id: "cessazioni",
        title: "Gestire dimissioni o licenziamenti",
      },
      {
        id: "organizzazione",
        title: "Organizzare personale, welfare e rapporti sindacali",
      },
      {
        id: "ispezioni-lavoro",
        title: "Affrontare un'ispezione o un contenzioso",
      },
    ],
  },

  {
    id: "sicurezza",
    title: "Mettere in sicurezza la mia attività",
    description: "DVR, RSPP, valutazione dei rischi e adempimenti.",

    options: [
      {
        id: "rspp",
        title: "Ho bisogno di un RSPP esterno",
      },
      {
        id: "dvr",
        title: "Devo fare o aggiornare il DVR",
      },
      {
        id: "rischi",
        title: "Devo valutare rischi specifici",
      },
      {
        id: "organizzazione-sicurezza",
        title: "Gestire DPI, medico competente e sicurezza interna",
      },
      {
        id: "infortunio",
        title: "Ho avuto un infortunio o un'ispezione",
      },
    ],
  },

  {
    id: "settori",
    title: "Gestire un cantiere o un settore specifico",
    description: "Cantieri, documentazione e sicurezza specialistica.",

    options: [
      {
        id: "cantiere",
        title: "Gestire un cantiere edile",
      },
      {
        id: "psc-pos",
        title: "Preparare PSC, POS o documentazione di cantiere",
      },
      {
        id: "coordinamento",
        title: "Ho bisogno di CSP o CSE",
      },
      {
        id: "chimico",
        title: "Gestire un'attività chimica o petrolchimica",
      },
      {
        id: "atex-seveso",
        title: "Gestire ATEX, Seveso o sostanze pericolose",
      },
    ],
  },

  {
    id: "formazione",
    title: "Formare me o i miei lavoratori",
    description: "Corsi obbligatori e formazione sulla sicurezza.",

    options: [
      {
        id: "lavoratori",
        title: "Formazione lavoratori",
      },
      {
        id: "preposti-dirigenti",
        title: "Formazione preposti e dirigenti",
      },
      {
        id: "rls-rspp",
        title: "Formazione RLS, RSPP o Datore di Lavoro",
      },
      {
        id: "attrezzature",
        title: "Corsi per attrezzature e lavori particolari",
      },
      {
        id: "emergenze",
        title: "Antincendio e primo soccorso",
      },
    ],
  },

  {
    id: "contabilita",
    title: "Contabilità e adempimenti",
    description: "Contabilità, dichiarazioni e gestione fiscale.",

    options: [
      {
        id: "contabilita-azienda",
        title: "Gestire la contabilità",
      },
      {
        id: "bilancio",
        title: "Preparare il bilancio",
      },
      {
        id: "dichiarazioni",
        title: "Dichiarazioni, IVA e F24",
      },
      {
        id: "regime-fiscale",
        title: "Scegliere regime fiscale o forma societaria",
      },
      {
        id: "accertamenti",
        title: "Gestire controlli o accertamenti fiscali",
      },
    ],
  },
];

export const privatoOptions = [
  {
    id: "domestico",
    title: "Gestire colf, badante o baby-sitter",
    description: "Contratti, buste paga e contributi.",

    options: [
      {
        id: "assunzione-domestico",
        title: "Assumere colf, badante o baby-sitter",
      },
      {
        id: "busta-paga-domestico",
        title: "Gestire buste paga e contributi",
      },
      {
        id: "cessazione-domestico",
        title: "Terminare il rapporto di lavoro",
      },
    ],
  },

  {
    id: "lavoro",
    title: "Ho un problema con il mio lavoro",
    description: "Dimissioni, TFR, NASpI e assistenza.",

    options: [
      {
        id: "dimissioni",
        title: "Devo dimettermi",
      },
      {
        id: "tfr",
        title: "Ho bisogno di chiarimenti sul TFR",
      },
      {
        id: "naspi",
        title: "Ho bisogno di assistenza per la NASpI",
      },
      {
        id: "controversia",
        title: "Ho una controversia di lavoro",
      },
      {
        id: "prestazione",
        title: "Devo gestire una collaborazione o prestazione occasionale",
      },
    ],
  },

  {
    id: "pensione",
    title: "Pensione e contributi",
    description: "Pratiche pensionistiche e previdenziali.",

    options: [
      {
        id: "pensione-pratica",
        title: "Voglio capire la mia situazione pensionistica",
      },
      {
        id: "ricongiunzione",
        title: "Devo ricongiungere o verificare i contributi",
      },
      {
        id: "pratica-previdenziale",
        title: "Ho bisogno di assistenza previdenziale",
      },
    ],
  },

  {
    id: "sicurezza-privati",
    title: "Sicurezza per casa o piccola attività",
    description: "Condomini, ristrutturazioni e piccole attività.",

    options: [
      {
        id: "condominio",
        title: "Sicurezza per un condominio",
      },
      {
        id: "piccola-attivita",
        title: "Sicurezza per una piccola attività",
      },
      {
        id: "ristrutturazione",
        title: "Sto facendo lavori o una ristrutturazione",
      },
      {
        id: "corso-privato",
        title: "Mi serve un corso o un patentino",
      },
    ],
  },

  {
    id: "enti",
    title: "Pratiche con enti pubblici",
    description: "INPS, INAIL e Centro per l'Impiego.",

    options: [
      {
        id: "inps",
        title: "Devo fare una pratica INPS",
      },
      {
        id: "inail",
        title: "Devo fare una pratica INAIL",
      },
      {
        id: "centro-impiego",
        title: "Ho bisogno del Centro per l'Impiego",
      },
      {
        id: "consulenza",
        title: "Non so quale pratica mi serve",
      },
    ],
  },
];
