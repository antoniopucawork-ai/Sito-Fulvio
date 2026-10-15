import {
  ShieldCheck,
  ClipboardCheck,
  HardHat,
  FlaskConical,
  UsersRound,
  TriangleAlert,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { contactConfig } from "../data/contactConfig.js";
import "./SafetyPage.css";

const safetyAreas = [
  {
    id: "gestione-sicurezza",

    icon: ShieldCheck,
    title: "Gestire la sicurezza della tua azienda",
    description:
      "Supporto continuativo al Datore di Lavoro per organizzare correttamente la prevenzione e mantenere sotto controllo gli adempimenti aziendali.",
    details: [
      "Incarico di RSPP esterno",
      "Sopralluoghi periodici",
      "Verifica delle misure di prevenzione",
      "Supporto negli adempimenti di sicurezza",
    ],
  },
  {
    id: "valutazione-rischi",

    icon: ClipboardCheck,
    title: "Valutare i rischi",
    description:
      "Dalla valutazione generale dell'azienda alla gestione dei rischi specifici legati alle attività svolte.",
    details: [
      "Documento di Valutazione dei Rischi (DVR)",
      "Valutazione completa dei rischi aziendali",
      "Rischio incendio e C.P.I.",
      "Rischio chimico e biologico",
      "Rumore e vibrazioni",
      "Stress lavoro-correlato",
      "Movimentazione manuale dei carichi",
      "Rischio ATEX",
      "DUVRI",
    ],
  },
  {
    id: "cantieri",

    icon: HardHat,
    title: "Cantieri ed edilizia",
    description:
      "Supporto per la gestione della sicurezza nei cantieri, dalla documentazione alla fase di progettazione ed esecuzione dei lavori.",
    details: [
      "PSC",
      "POS",
      "Fascicolo tecnico dell'opera",
      "Supporto per nomina CSP e CSE",
      "Coordinamento della sicurezza",
      "Notifiche preliminari",
    ],
  },
  {
    id: "chimico-petrolchimico",

    icon: FlaskConical,
    title: "Settore chimico e petrolchimico",
    description:
      "Consulenza specialistica per aziende che operano in contesti caratterizzati da rischi chimici, atmosfere esplosive e attività ad alto rischio.",
    details: [
      "Rischio ATEX",
      "Seveso III",
      "Piani di emergenza interna",
      "Permessi di lavoro ad alto rischio",
      "Gestione sostanze pericolose",
      "Schede di sicurezza SDS",
      "Etichettatura CLP",
      "Monitoraggio dell'esposizione professionale",
    ],
  },
  {
    id: "organizzazione",

    icon: UsersRound,
    title: "Organizzare la prevenzione",
    description:
      "Aiuto nell'organizzazione delle figure, delle procedure e degli strumenti necessari per gestire la sicurezza in azienda.",
    details: [
      "Coordinamento con il Medico Competente",
      "Organizzazione del Servizio di Prevenzione e Protezione",
      "Gestione RLS e RLST",
      "Gestione DPI",
      "Gestione sicurezza negli appalti",
      "Safety audit",
      "Supporto ISO 45001",
    ],
  },
  {
    id: "infortuni-ispezioni",

    icon: TriangleAlert,
    title: "Infortuni e ispezioni",
    description:
      "Assistenza quando si verifica un infortunio o quando l'azienda deve affrontare controlli e verifiche da parte degli organi competenti.",
    details: [
      "Gestione infortuni",
      "Denunce INAIL",
      "Assistenza durante le ispezioni",
      "Analisi delle cause di infortunio",
      "Supporto in caso di indagini",
    ],
  },
];

const SafetyPage = () => {
  const createWhatsappUrl = () => {
    const message = `Salve Dott. Fulvio Martello, arrivo dal suo sito.

Avrei bisogno di informazioni sui servizi di sicurezza sul lavoro.

La mia esigenza è:`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  return (
    <>
      <Navbar />

      <main className="safety-page">
        {/* HERO */}

        <section className="safety-hero">
          <div className="safety-hero__content">
            <span className="safety-hero__eyebrow">SICUREZZA SUL LAVORO</span>

            <h1 className="safety-hero__title">
              La sicurezza della tua azienda,
              <span> spiegata in modo semplice.</span>
            </h1>

            <p className="safety-hero__description">
              Supporto per aziende e datori di lavoro nella valutazione dei
              rischi, nell&apos;organizzazione della sicurezza e nella gestione
              degli adempimenti.
            </p>

            <a
              href={createWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="safety-hero__cta"
            >
              Richiedi informazioni
              <ArrowRight size={19} />
            </a>
          </div>
        </section>

        {/* INTRO */}

        <section className="safety-intro">
          <div className="safety-intro__content">
            <span className="safety-intro__eyebrow">
              NON SAI DA DOVE INIZIARE?
            </span>

            <h2>Non devi conoscere già il servizio che ti serve.</h2>

            <p>
              DVR, RSPP, DUVRI, ATEX e altri termini tecnici possono essere
              difficili da interpretare se non fanno parte del tuo lavoro.
            </p>

            <p>
              Il Dott. Fulvio Martello è consulente della sicurezza e ha
              completato la formazione RSPP nei moduli A, B, C, B-SP3 e B-SP5.
            </p>
          </div>
        </section>

        {/* AREE */}

        <section className="safety-services">
          <div className="safety-services__header">
            <span>AMBITI DI INTERVENTO</span>

            <h2>Come può aiutarti il Dott. Fulvio Martello</h2>

            <p>
              I servizi di sicurezza vengono organizzati qui per esigenza, così
              da rendere più semplice capire quale area riguarda la tua
              situazione.
            </p>
          </div>

          <div className="safety-services__grid">
            {safetyAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article key={area.id} className="safety-card">
                  <div className="safety-card__top">
                    <Icon
                      className="safety-card__icon"
                      size={28}
                      aria-hidden="true"
                    />
                  </div>

                  <h3>{area.title}</h3>

                  <p className="safety-card__description">{area.description}</p>

                  <ul className="safety-card__details">
                    {area.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* SUPPORTO */}

        <section className="safety-help">
          <div className="safety-help__content">
            <ShieldCheck size={32} className="safety-help__icon" />

            <span>UN SUPPORTO DIRETTO</span>

            <h2>Non sai esattamente quale documento o adempimento ti serve?</h2>

            <p>
              Descrivi brevemente la tua situazione. Non è necessario conoscere
              già il nome tecnico del servizio di cui hai bisogno.
            </p>
          </div>
        </section>

        {/* CTA FINALE */}

        <section className="safety-contact">
          <div className="safety-contact__content">
            <span>SICUREZZA SUL LAVORO</span>

            <h2>Hai bisogno di supporto?</h2>

            <p>
              Contatta il Dott. Fulvio Martello e descrivi brevemente la
              situazione della tua azienda.
            </p>

            <a
              href={createWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="safety-contact__button"
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

export default SafetyPage;
