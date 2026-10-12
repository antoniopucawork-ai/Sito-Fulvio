import {
  GraduationCap,
  Users,
  ShieldCheck,
  Forklift,
  Building2,
  Laptop,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { contactConfig } from "../data/contactConfig.js";
import "./FormationPage.css";

const formationAreas = [
  {
    id: "lavoratori",
    number: "01",
    icon: Users,
    title: "Formazione per lavoratori, preposti e dirigenti",
    description:
      "Percorsi formativi per le principali figure aziendali, dalla formazione generale e specifica agli aggiornamenti periodici.",
    details: [
      "Formazione generale dei lavoratori",
      "Formazione specifica rischio basso, medio e alto",
      "Formazione preposti",
      "Formazione dirigenti",
      "Aggiornamenti periodici",
    ],
  },
  {
    id: "figure-sicurezza",
    number: "02",
    icon: ShieldCheck,
    title: "RLS, RSPP e figure della sicurezza",
    description:
      "Formazione dedicata alle figure che ricoprono ruoli specifici nella gestione della salute e sicurezza sul lavoro.",
    details: [
      "Corso RLS e aggiornamenti",
      "Corsi RSPP e ASPP",
      "Moduli A, B e C",
      "Modulo B specifico edilizia",
      "Modulo B specifico chimico",
      "Modulo B specifico pesca",
      "Modulo B specifico agricoltura",
      "Modulo B specifico sanità",
      "Formazione per Datori di Lavoro che svolgono il ruolo di RSPP",
    ],
  },
  {
    id: "attrezzature",
    number: "03",
    icon: Forklift,
    title: "Attrezzature e mansioni specifiche",
    description:
      "Corsi e addestramento per attività che richiedono competenze pratiche specifiche o l'utilizzo di particolari attrezzature.",
    details: [
      "Carrelli elevatori",
      "Gru e autogru",
      "Piattaforme di lavoro elevabili PLE",
      "Escavatori",
      "Carroponte",
      "Lavori in quota",
      "DPI anticaduta",
      "Spazi confinati",
      "Antincendio",
      "Primo soccorso",
      "Rischio chimico e ATEX",
      "Ponteggi e PIMUS",
    ],
  },
  {
    id: "specialistica",
    number: "04",
    icon: Building2,
    title: "Formazione specialistica",
    description:
      "Percorsi rivolti ad aziende e figure professionali che operano in contesti complessi o ad alto rischio.",
    details: [
      "Formazione preposti di cantiere",
      "Formazione su Seveso III",
      "Gestione del rischio di incidente rilevante",
      "Aggiornamenti normativi sulla sicurezza",
      "Modelli organizzativi 231 e reati in materia di sicurezza",
    ],
  },
];

const deliveryMethods = [
  "Formazione in aula presso l'azienda",
  "Formazione a distanza, ove consentito",
  "Formazione pratica in cantieri e impianti",
  "E-learning con piattaforma dedicata",
];

const FormationPage = () => {
  const createWhatsappUrl = () => {
    const message = `Salve Dott. Fulvio Martello, arrivo dal suo sito.

Avrei bisogno di informazioni sui corsi di formazione
e sui percorsi disponibili per la mia azienda.

La mia esigenza è:`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  return (
    <>
      <Navbar />

      <main className="formation-page">
        {/* HERO */}

        <section className="formation-hero">
          <div className="formation-hero__content">
            <span className="formation-hero__eyebrow">FORMAZIONE</span>

            <h1 className="formation-hero__title">
              La formazione giusta per lavorare
              <span> in sicurezza.</span>
            </h1>

            <p className="formation-hero__description">
              Corsi per aziende, lavoratori e figure della sicurezza, dalla
              formazione obbligatoria agli aggiornamenti e ai percorsi
              specialistici.
            </p>

            <a
              href={createWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="formation-hero__cta"
            >
              Richiedi informazioni
              <ArrowRight size={19} />
            </a>
          </div>
        </section>

        {/* ORIENTAMENTO */}

        <section className="formation-intro">
          <div className="formation-intro__content">
            <GraduationCap size={34} className="formation-intro__icon" />

            <span className="formation-intro__eyebrow">
              NON SAI QUALE CORSO SERVE?
            </span>

            <h2>
              Ogni ruolo e ogni attività possono richiedere una formazione
              diversa.
            </h2>

            <p>
              Non è necessario conoscere già il nome del corso. Puoi partire dal
              ruolo della persona da formare, dall&apos;attività svolta o
              dall&apos;attrezzatura utilizzata.
            </p>

            <p>
              Il Dott. Fulvio Martello, formatore per la sicurezza sui luoghi di
              lavoro, può aiutarti a individuare il percorso formativo più
              adatto alle esigenze della tua azienda.
            </p>
          </div>
        </section>

        {/* AREE FORMATIVE */}

        <section className="formation-services">
          <div className="formation-services__header">
            <span>AREE FORMATIVE</span>

            <h2>Che tipo di formazione ti serve?</h2>

            <p>
              I corsi sono organizzati per esigenza, così da rendere più
              semplice capire quale percorso può essere adatto alla tua azienda
              o al ruolo da formare.
            </p>
          </div>

          <div className="formation-services__grid">
            {formationAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article key={area.id} className="formation-card">
                  <div className="formation-card__top">
                    <span className="formation-card__number">
                      {area.number}
                    </span>

                    <Icon size={28} className="formation-card__icon" />
                  </div>

                  <div className="formation-card__main">
                    <h3>{area.title}</h3>

                    <p className="formation-card__description">
                      {area.description}
                    </p>
                  </div>

                  <ul className="formation-card__details">
                    {area.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* MODALITÀ */}

        <section className="formation-methods">
          <div className="formation-methods__content">
            <div className="formation-methods__heading">
              <Laptop size={32} className="formation-methods__icon" />

              <span>MODALITÀ DI EROGAZIONE</span>

              <h2>La formazione può essere organizzata in modi diversi.</h2>

              <p>
                In base al tipo di corso e alle modalità consentite, la
                formazione può essere svolta in azienda, a distanza o attraverso
                attività pratiche.
              </p>
            </div>

            <div className="formation-methods__list">
              {deliveryMethods.map((method, index) => (
                <div key={method} className="formation-method">
                  <span>{String(index + 1).padStart(2, "0")}</span>

                  <p>{method}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINALE */}

        <section className="formation-contact">
          <div className="formation-contact__content">
            <span>FORMAZIONE</span>

            <h2>Devi organizzare un corso o capire quale formazione serve?</h2>

            <p>
              Descrivi brevemente chi deve essere formato e il tipo di attività
              svolta. Non è necessario conoscere già il nome tecnico del corso.
            </p>

            <a
              href={createWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="formation-contact__button"
            >
              <MessageCircle size={20} />
              Contatta il Dott. Fulvio Martello
            </a>
          </div>
        </section>
      </main>
    </>
  );
};

export default FormationPage;
