import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { contactConfig } from "../data/contactConfig.js";
import "./PrivateServicesPage.css";

const privateServiceAreas = [
  {
    id: "lavoro-previdenza",
    number: "01",
    icon: BriefcaseBusiness,
    eyebrow: "LAVORO E PREVIDENZA",
    title: "Lavoro e contributi",
    question: "Hai bisogno di aiuto con il lavoro o i contributi?",
    description:
      "Rapporti di lavoro domestico, contributi, dimissioni, TFR, NASpI, pensione e altre esigenze legate al lavoro.",
    services: [
      {
        id: "lavoro-domestico",
        label: "Colf, badante o baby-sitter",
        description: "Contratti e gestione del rapporto di lavoro domestico.",
      },
      {
        id: "buste-paga-domestici",
        label: "Buste paga e contributi INPS",
        description:
          "Gestione di buste paga e contributi per lavoratori domestici.",
      },
      {
        id: "dimissioni",
        label: "Dimissioni",
        description:
          "Supporto per comprendere e gestire correttamente le dimissioni.",
      },
      {
        id: "tfr",
        label: "TFR",
        description:
          "Assistenza per verifiche e questioni relative al trattamento di fine rapporto.",
      },
      {
        id: "naspi",
        label: "NASpI",
        description:
          "Supporto per le esigenze collegate alla disoccupazione NASpI.",
      },
      {
        id: "pensione",
        label: "Pensione",
        description:
          "Assistenza per pratiche e valutazioni relative alla pensione.",
      },
      {
        id: "ricongiunzioni",
        label: "Ricongiunzioni contributive",
        description:
          "Supporto per la gestione delle ricongiunzioni contributive.",
      },
      {
        id: "collaborazioni-occasionali",
        label: "Collaborazioni occasionali e PrestO",
        description: "Consulenza su collaborazioni e prestazioni occasionali.",
      },
    ],
  },

  {
    id: "sicurezza-piccole-realta",
    number: "02",
    icon: ShieldCheck,
    eyebrow: "SICUREZZA E PICCOLE REALTÀ",
    title: "Sicurezza o lavori",
    question:
      "Devi gestire sicurezza, formazione o lavori in una piccola realtà?",
    description:
      "Supporto per condomìni, piccole attività, formazione e ristrutturazioni private.",
    services: [
      {
        id: "sicurezza-condominio",
        label: "Sicurezza per condomìni",
        description:
          "Consulenza sulla sicurezza del condominio e degli eventuali lavoratori presenti.",
      },
      {
        id: "piccole-attivita",
        label: "Sicurezza per piccole attività",
        description: "Supporto per piccole attività commerciali e artigianali.",
      },
      {
        id: "primo-soccorso",
        label: "Formazione primo soccorso",
        description: "Formazione per singoli o piccoli gruppi.",
      },
      {
        id: "antincendio",
        label: "Formazione antincendio",
        description: "Formazione antincendio per singoli o piccoli gruppi.",
      },
      {
        id: "ristrutturazioni",
        label: "Ristrutturazioni private",
        description:
          "Consulenza per lavori edili privati, in particolare quando sono coinvolte più imprese.",
      },
      {
        id: "csp-cse",
        label: "Nomina CSP / CSE",
        description:
          "Supporto nelle situazioni in cui è necessario gestire il coordinamento della sicurezza.",
      },
      {
        id: "patentino-attrezzature",
        label: "Corsi patentino per attrezzature",
        description:
          "Corsi per attrezzature rivolti anche a privati e hobbisti.",
      },
    ],
  },

  {
    id: "pratiche-assistenza",
    number: "03",
    icon: FileText,
    eyebrow: "PRATICHE E ASSISTENZA",
    title: "Pratiche e assistenza",
    question: "Hai una pratica da gestire o una situazione da chiarire?",
    description:
      "Supporto previdenziale di base, pratiche con enti pubblici e controversie legate al lavoro.",
    services: [
      {
        id: "consulenza-previdenziale",
        label: "Consulenza fiscale-previdenziale",
        description:
          "Consulenza di base collegata alle esigenze di lavoro e previdenza.",
      },
      {
        id: "pratiche-inps",
        label: "Pratiche INPS",
        description: "Assistenza nella gestione di pratiche con l'INPS.",
      },
      {
        id: "pratiche-inail",
        label: "Pratiche INAIL",
        description: "Assistenza nella gestione di pratiche con l'INAIL.",
      },
      {
        id: "centro-impiego",
        label: "Centro per l'Impiego",
        description: "Supporto per pratiche collegate al Centro per l'Impiego.",
      },
      {
        id: "controversie-lavoro",
        label: "Controversie individuali di lavoro",
        description:
          "Supporto nella gestione di controversie individuali legate al lavoro.",
      },
    ],
  },
];

const PrivateServicesPage = () => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const guideRef = useRef(null);

  const currentArea = privateServiceAreas.find(
    (area) => area.id === selectedArea,
  );

  const currentService = currentArea?.services.find(
    (service) => service.id === selectedService,
  );

  useEffect(() => {
    if (!selectedArea) return;

    guideRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedArea, selectedService]);

  const handleSelectArea = (areaId) => {
    setSelectedArea(areaId);
    setSelectedService(null);
  };

  const handleSelectService = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  const createWhatsappUrl = () => {
    if (!currentArea || !currentService) {
      const genericMessage = `Buongiorno Fulvio, arrivo dal suo sito.

Avrei bisogno di informazioni su un servizio per privati.

La mia esigenza è:`;

      return `https://wa.me/${contactConfig.whatsappNumber}?text=${encodeURIComponent(
        genericMessage,
      )}`;
    }

    const path = `Servizi per privati → ${currentArea.title} → ${currentService.label}`;

    const message = `Buongiorno Fulvio, arrivo dal suo sito.

Sono un privato e avrei bisogno di informazioni sulla seguente esigenza:

${currentService.label}

Percorso dal sito:
${path}`;

    return `https://wa.me/${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  return (
    <>
      <Navbar />

      <main className="private-page">
        {/* =========================
            HERO
        ========================= */}

        <section className="private-hero">
          <div className="private-hero__content">
            <span className="private-hero__eyebrow">SERVIZI PER PRIVATI</span>

            <h1 className="private-hero__title">
              Parti dal tuo problema.
              <span> Ti aiutiamo a trovare il servizio giusto.</span>
            </h1>

            <p className="private-hero__description">
              Lavoro, contributi, previdenza, pratiche, sicurezza e
              ristrutturazioni. Non devi conoscere già il nome tecnico del
              servizio di cui hai bisogno.
            </p>

            <a href="#private-guide" className="private-hero__cta">
              Trova ciò che ti serve
              <ArrowRight size={19} />
            </a>
          </div>
        </section>

        {/* =========================
            GUIDA - INTRO
        ========================= */}

        <section id="private-guide" ref={guideRef} className="private-guide">
          <div className="private-guide__header">
            <HeartHandshake size={32} className="private-guide__header-icon" />

            <span>TI GUIDIAMO NOI</span>

            <h2>Di cosa hai bisogno?</h2>

            <p>
              Scegli l&apos;area che descrive meglio la tua situazione. Nel
              passaggio successivo potrai indicare l&apos;esigenza specifica.
            </p>
          </div>

          {/* STEP 1 - AREA */}

          {!selectedArea && (
            <div className="private-guide__areas">
              {privateServiceAreas.map((area) => {
                const Icon = area.icon;

                return (
                  <button
                    key={area.id}
                    type="button"
                    className="private-guide__area-card"
                    onClick={() => handleSelectArea(area.id)}
                  >
                    <div className="private-guide__area-top">
                      <span>{area.number}</span>

                      <Icon size={27} />
                    </div>

                    <div className="private-guide__area-content">
                      <span>{area.eyebrow}</span>

                      <h3>{area.title}</h3>

                      <p>{area.description}</p>
                    </div>

                    <ArrowRight size={20} className="private-guide__arrow" />
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 - ESIGENZA */}

          {selectedArea && currentArea && !selectedService && (
            <div className="private-guide__step">
              <button
                type="button"
                className="private-guide__back"
                onClick={handleBackToAreas}
              >
                <ArrowLeft size={18} />
                Torna alle aree
              </button>

              <div className="private-guide__breadcrumb">
                <span>Servizi per privati</span>
                <span>→</span>
                <strong>{currentArea.title}</strong>
              </div>

              <div className="private-guide__step-heading">
                <span>{currentArea.eyebrow}</span>

                <h2>{currentArea.question}</h2>

                <p>Seleziona l&apos;opzione più vicina alla tua situazione.</p>
              </div>

              <div className="private-guide__service-list">
                {currentArea.services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    className="private-guide__service"
                    onClick={() => handleSelectService(service.id)}
                  >
                    <div>
                      <h3>{service.label}</h3>
                      <p>{service.description}</p>
                    </div>

                    <ArrowRight size={19} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 - RISULTATO */}

          {selectedArea && selectedService && currentArea && currentService && (
            <div className="private-guide__result">
              <button
                type="button"
                className="private-guide__back"
                onClick={handleBackToServices}
              >
                <ArrowLeft size={18} />
                Cambia esigenza
              </button>

              <div className="private-guide__breadcrumb">
                <span>Servizi per privati</span>
                <span>→</span>
                <span>{currentArea.title}</span>
                <span>→</span>
                <strong>{currentService.label}</strong>
              </div>

              <div className="private-guide__result-card">
                <div className="private-guide__result-icon">
                  <Check size={23} />
                </div>

                <span>HAI SELEZIONATO</span>

                <h2>{currentService.label}</h2>

                <p>{currentService.description}</p>

                <div className="private-guide__result-path">
                  <span>Percorso</span>

                  <strong>
                    Servizi per privati → {currentArea.title} →{" "}
                    {currentService.label}
                  </strong>
                </div>

                <a
                  href={createWhatsappUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="private-guide__whatsapp"
                >
                  <MessageCircle size={20} />
                  Contatta Fulvio su WhatsApp
                </a>

                <p className="private-guide__whatsapp-note">
                  Fulvio riceverà già il percorso che hai selezionato.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =========================
            PARTE INFORMATIVA
        ========================= */}

        <section className="private-information">
          <div className="private-information__header">
            <span>TUTTI I SERVIZI PER PRIVATI</span>

            <h2>Vuoi vedere tutte le possibilità?</h2>

            <p>
              Puoi anche consultare liberamente le principali aree di assistenza
              disponibili.
            </p>
          </div>

          <div className="private-information__list">
            {privateServiceAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article key={area.id} className="private-information__area">
                  <div className="private-information__number">
                    {area.number}
                  </div>

                  <div className="private-information__main">
                    <div className="private-information__eyebrow">
                      <Icon size={25} />
                      <span>{area.eyebrow}</span>
                    </div>

                    <h3>{area.question}</h3>

                    <p>{area.description}</p>
                  </div>

                  <ul className="private-information__services">
                    {area.services.map((service) => (
                      <li key={service.id}>{service.label}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================
            HELP
        ========================= */}

        <section className="private-help">
          <div className="private-help__content">
            <UserRound size={32} className="private-help__icon" />

            <div>
              <span>NON TROVI LA TUA SITUAZIONE?</span>

              <h2>Puoi comunque raccontarla direttamente a Fulvio.</h2>

              <p>
                Il percorso guidato serve ad aiutarti, non a limitarti. Se la
                tua esigenza non rientra perfettamente nelle opzioni, puoi
                descriverla liberamente.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            CTA GENERICA
        ========================= */}

        <section className="private-contact">
          <div className="private-contact__content">
            <span>SERVIZI PER PRIVATI</span>

            <h2>Hai ancora un dubbio?</h2>

            <p>Contatta Fulvio e descrivi brevemente ciò che devi risolvere.</p>

            <a
              href={createWhatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="private-contact__button"
            >
              <MessageCircle size={20} />
              Contatta Fulvio su WhatsApp
            </a>
          </div>
        </section>
      </main>
    </>
  );
};

export default PrivateServicesPage;
