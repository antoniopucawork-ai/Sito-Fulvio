import { useEffect, useRef, useState } from "react";
import {
  Building2,
  UserRound,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Check,
} from "lucide-react";

import "./ServicesPage.css";
import Navbar from "../components/Navbar/Navbar.jsx";
import { servicesCatalog } from "../data/servicesCatalog.js";
import { contactConfig } from "../data/contactConfig.js";

const ServicesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const stepRef = useRef(null);

  const currentCatalog = selectedUser ? servicesCatalog[selectedUser] : null;

  const currentArea = currentCatalog?.areas.find(
    (area) => area.id === selectedArea,
  );

  const currentSection = currentArea?.sections.find(
    (section) => section.id === selectedSection,
  );

  useEffect(() => {
    if (!selectedUser) return;

    stepRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedUser, selectedArea, selectedSection, selectedService]);

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    setSelectedArea(null);
    setSelectedSection(null);
    setSelectedService(null);
  };

  const handleSelectArea = (areaId) => {
    setSelectedArea(areaId);
    setSelectedSection(null);
    setSelectedService(null);
  };

  const handleSelectSection = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedService(null);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  const handleBackToStart = () => {
    setSelectedUser(null);
    setSelectedArea(null);
    setSelectedSection(null);
    setSelectedService(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
    setSelectedSection(null);
    setSelectedService(null);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  const createWhatsappUrl = () => {
    if (!selectedUser || !currentArea || !currentSection || !selectedService) {
      return "#";
    }

    const userLabel = selectedUser === "aziende" ? "un'azienda" : "un privato";

    const path = `${
      selectedUser === "aziende" ? "Aziende" : "Privati"
    } → ${currentArea.title} → ${currentSection.title} → ${selectedService}`;

    const message = `Salve ${contactConfig.professionalName}, arrivo dal suo sito.

Sono ${userLabel} e avrei bisogno di informazioni sul seguente servizio:

${selectedService}

Percorso dal sito:
${path}`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  return (
    <>
      <Navbar />

      <main className="services-page">
        {/* INTRO */}

        <section className="services-page__hero">
          <span className="services-page__eyebrow">TUTTI I SERVIZI</span>

          <h1 className="services-page__title">Come possiamo aiutarti?</h1>

          <p className="services-page__description">
            Consulta liberamente i servizi disponibili e scegli l&apos;area più
            vicina alla tua esigenza.
          </p>
        </section>

        {/* STEP 1 - AZIENDE / PRIVATI */}

        {!selectedUser && (
          <section className="services-page__step">
            <h2>Scegli la tua area</h2>

            <div className="services-page__macro-options">
              <button
                type="button"
                className="services-page__macro-card"
                onClick={() => handleSelectUser("aziende")}
              >
                <Building2 size={26} />

                <div>
                  <span>PER LE AZIENDE</span>

                  <h3>Servizi per aziende</h3>

                  <p>
                    Consulenza del lavoro, sicurezza, formazione, contabilità e
                    servizi avanzati.
                  </p>
                </div>

                <ArrowRight size={20} />
              </button>

              <button
                type="button"
                className="services-page__macro-card"
                onClick={() => handleSelectUser("privati")}
              >
                <UserRound size={26} />

                <div>
                  <span>PER I PRIVATI</span>

                  <h3>Servizi per privati</h3>

                  <p>
                    Lavoro, previdenza, sicurezza, formazione e assistenza per
                    pratiche.
                  </p>
                </div>

                <ArrowRight size={20} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2 - AREE */}

        {selectedUser && currentCatalog && !selectedArea && (
          <section ref={stepRef} className="services-page__step">
            <button
              type="button"
              className="services-page__back"
              onClick={handleBackToStart}
            >
              <ArrowLeft size={18} />
              Indietro
            </button>

            <div className="services-page__heading">
              <span>
                {selectedUser === "aziende"
                  ? "PER LE AZIENDE"
                  : "PER I PRIVATI"}
              </span>

              <h2>{currentCatalog.title}</h2>

              <p>Scegli l&apos;area che vuoi consultare.</p>
            </div>

            <div className="services-page__areas">
              {currentCatalog.areas.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  className="services-page__area-card"
                  onClick={() => handleSelectArea(area.id)}
                >
                  <div>
                    <h3>{area.title}</h3>

                    <p>
                      {area.sections.length}{" "}
                      {area.sections.length === 1
                        ? "sezione disponibile"
                        : "sezioni disponibili"}
                    </p>
                  </div>

                  <ArrowRight size={20} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 3 - SEZIONI */}

        {selectedUser && selectedArea && currentArea && !selectedSection && (
          <section ref={stepRef} className="services-page__step">
            <button
              type="button"
              className="services-page__back"
              onClick={handleBackToAreas}
            >
              <ArrowLeft size={18} />
              Indietro
            </button>

            <div className="services-page__breadcrumb">
              <span>{selectedUser === "aziende" ? "Aziende" : "Privati"}</span>

              <span>→</span>

              <span>{currentArea.title}</span>
            </div>

            <div className="services-page__heading">
              <span>AREA</span>

              <h2>{currentArea.title}</h2>

              <p>Scegli la sezione che vuoi approfondire.</p>
            </div>

            <div className="services-page__sections">
              {currentArea.sections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  className="services-page__section-card"
                  onClick={() => handleSelectSection(section.id)}
                >
                  <div>
                    <h3>{section.title}</h3>

                    <p>
                      {section.services.length}{" "}
                      {section.services.length === 1 ? "servizio" : "servizi"}
                    </p>
                  </div>

                  <ArrowRight size={20} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 4 - SERVIZI */}

        {selectedUser &&
          selectedArea &&
          selectedSection &&
          currentArea &&
          currentSection &&
          !selectedService && (
            <section ref={stepRef} className="services-page__step">
              <button
                type="button"
                className="services-page__back"
                onClick={handleBackToSections}
              >
                <ArrowLeft size={18} />
                Indietro
              </button>

              <div className="services-page__breadcrumb">
                <span>
                  {selectedUser === "aziende" ? "Aziende" : "Privati"}
                </span>

                <span>→</span>

                <span>{currentArea.title}</span>

                <span>→</span>

                <span>{currentSection.title}</span>
              </div>

              <div className="services-page__heading">
                <span>SEZIONE</span>

                <h2>{currentSection.title}</h2>

                <p>Seleziona il servizio che ti interessa.</p>
              </div>

              <div className="services-page__service-list">
                {currentSection.services.map((service) => (
                  <button
                    type="button"
                    key={service}
                    className="services-page__service-item"
                    onClick={() => handleSelectService(service)}
                  >
                    <span>{service}</span>

                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </section>
          )}

        {/* STEP 5 - SERVIZIO FINALE */}

        {selectedUser &&
          selectedArea &&
          selectedSection &&
          selectedService &&
          currentArea &&
          currentSection && (
            <section ref={stepRef} className="services-page__step">
              <button
                type="button"
                className="services-page__back"
                onClick={handleBackToServices}
              >
                <ArrowLeft size={18} />
                Indietro
              </button>

              <div className="services-page__breadcrumb">
                <span>
                  {selectedUser === "aziende" ? "Aziende" : "Privati"}
                </span>

                <span>→</span>

                <span>{currentArea.title}</span>

                <span>→</span>

                <span>{currentSection.title}</span>

                <span>→</span>

                <span>{selectedService}</span>
              </div>

              <div className="services-page__service-detail">
                <span>SERVIZIO</span>

                <h2>{selectedService}</h2>

                <p>
                  Hai individuato il servizio di tuo interesse. Puoi contattare
                  il Dott. Fulvio Martello per ricevere maggiori informazioni e
                  capire come procedere.
                </p>

                <div className="services-page__service-selected">
                  <Check size={18} />

                  <span>{selectedService}</span>
                </div>

                <a
                  href={createWhatsappUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="services-page__whatsapp"
                >
                  <MessageCircle size={20} />
                  Contatta il Dott. Fulvio Martello
                </a>
              </div>
            </section>
          )}
      </main>
    </>
  );
};

export default ServicesPage;
