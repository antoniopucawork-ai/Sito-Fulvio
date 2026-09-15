import { useState } from "react";

import {
  Building2,
  UserRound,
  ArrowRight,
  ArrowLeft,
  Users,
  ShieldCheck,
  HardHat,
  GraduationCap,
  Calculator,
  House,
  BriefcaseBusiness,
  Landmark,
  FileText,
  Check,
  MessageCircle,
} from "lucide-react";

import "./UserChoice.css";

import { aziendaOptions, privatoOptions } from "../../data/serviceOptions.js";
import { serviceDestinations } from "../../data/serviceDestinations.js";
import { contactConfig } from "../../data/contactConfig.js";

const UserChoice = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedNeed, setSelectedNeed] = useState(null);

  const currentOptions =
    selectedUser === "azienda"
      ? aziendaOptions
      : selectedUser === "privato"
        ? privatoOptions
        : [];

  const currentService = currentOptions.find(
    (option) => option.id === selectedService,
  );

  const currentNeed = currentService?.options.find(
    (option) => option.id === selectedNeed,
  );

  const currentDestination = selectedNeed
    ? serviceDestinations[selectedNeed]
    : null;

  const userLabel = selectedUser === "azienda" ? "Azienda" : "Privato";

  const getOptionIcon = (id) => {
    const icons = {
      personale: <Users size={22} />,
      sicurezza: <ShieldCheck size={22} />,
      settori: <HardHat size={22} />,
      formazione: <GraduationCap size={22} />,
      contabilita: <Calculator size={22} />,
      domestico: <House size={22} />,
      lavoro: <BriefcaseBusiness size={22} />,
      pensione: <Landmark size={22} />,
      "sicurezza-privati": <ShieldCheck size={22} />,
      enti: <FileText size={22} />,
    };

    return icons[id];
  };

  const handleBackToStart = () => {
    setSelectedUser(null);
    setSelectedService(null);
    setSelectedNeed(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setSelectedNeed(null);
  };

  const handleBackToNeeds = () => {
    setSelectedNeed(null);
  };

  const createWhatsappUrl = () => {
    if (!currentDestination || !currentNeed || !currentService) {
      return "#";
    }

    const message = `${currentDestination.whatsappMessage}

Percorso dal sito:
${userLabel} → ${currentService.title} → ${currentNeed.title}`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  const createGenericWhatsappUrl = () => {
    const message =
      "Buongiorno Fulvio, arrivo dal suo sito. Non sono sicuro di quale servizio mi serva e vorrei spiegare brevemente la mia situazione.";

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  return (
    <section className="user-choice" id="user-choice">
      {/* STEP 1 - TIPO UTENTE */}

      {!selectedUser && (
        <>
          <div className="user-choice__intro">
            <span className="user-choice__eyebrow">Partiamo da te</span>

            <h2 className="user-choice__title">Qual è la tua situazione?</h2>

            <p className="user-choice__description">
              Ti mostriamo solo ciò che può servirti, senza riempirti di
              informazioni inutili.
            </p>
          </div>

          <div className="user-choice__options">
            <button
              type="button"
              className="user-choice__card"
              onClick={() => setSelectedUser("azienda")}
            >
              <div className="user-choice__icon">
                <Building2 size={26} />
              </div>

              <div className="user-choice__card-content">
                <h3>Sono un&apos;azienda</h3>

                <p>
                  Personale, sicurezza, formazione, contabilità e adempimenti.
                </p>
              </div>

              <ArrowRight size={20} />
            </button>

            <button
              type="button"
              className="user-choice__card"
              onClick={() => setSelectedUser("privato")}
            >
              <div className="user-choice__icon">
                <UserRound size={26} />
              </div>

              <div className="user-choice__card-content">
                <h3>Sono un privato</h3>

                <p>
                  Lavoro domestico, pensioni, pratiche e assistenza personale.
                </p>
              </div>

              <ArrowRight size={20} />
            </button>
          </div>

          <div className="user-choice__help">
            <span>Non sai quale scegliere?</span>

            <a
              href={createGenericWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="user-choice__help-button"
            >
              <MessageCircle size={18} />
              Aiutami a capire cosa mi serve
            </a>
          </div>
        </>
      )}

      {/* STEP 2 - MACRO AREA */}

      {selectedUser && !selectedService && (
        <div className="user-choice__step">
          <button
            type="button"
            className="user-choice__back"
            onClick={handleBackToStart}
          >
            <ArrowLeft size={18} />
            Indietro
          </button>

          <div className="user-choice__results-heading">
            <span>
              {selectedUser === "azienda" ? "PER LA TUA AZIENDA" : "PER TE"}
            </span>

            <h2>Di cosa hai bisogno?</h2>

            <p>
              Scegli l&apos;area che si avvicina di più alla tua esigenza. Non
              serve conoscere il nome della pratica.
            </p>
          </div>

          <div className="user-choice__services">
            {currentOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                className="user-choice__service"
                onClick={() => setSelectedService(option.id)}
              >
                <div className="user-choice__service-icon">
                  {getOptionIcon(option.id)}
                </div>

                <div className="user-choice__service-content">
                  <h3>{option.title}</h3>
                </div>

                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 - ESIGENZA SPECIFICA */}

      {selectedUser &&
        selectedService &&
        currentService &&
        (!selectedNeed || !currentDestination) && (
          <div className="user-choice__step">
            <button
              type="button"
              className="user-choice__back"
              onClick={handleBackToServices}
            >
              <ArrowLeft size={18} />
              Indietro
            </button>

            <div className="user-choice__results-heading">
              <span>
                {selectedUser === "azienda" ? "PER LA TUA AZIENDA" : "PER TE"}
              </span>

              <h2>{currentService.title}</h2>

              <p>
                Quale di queste situazioni descrive meglio ciò di cui hai
                bisogno?
              </p>
            </div>

            <div className="user-choice__services">
              {currentService.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className="user-choice__service user-choice__service--simple"
                  onClick={() => setSelectedNeed(option.id)}
                >
                  <div className="user-choice__service-content">
                    <h3>{option.title}</h3>
                  </div>

                  <ArrowRight size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

      {/* STEP 4 - DESTINAZIONE */}

      {selectedUser &&
        selectedService &&
        selectedNeed &&
        currentDestination &&
        currentNeed && (
          <div className="user-choice__step">
            <button
              type="button"
              className="user-choice__back"
              onClick={handleBackToNeeds}
            >
              <ArrowLeft size={18} />
              Indietro
            </button>

            <div className="user-choice__breadcrumb">
              <span>{userLabel}</span>
              <span>→</span>
              <span>{currentService.title}</span>
            </div>

            <div className="user-choice__destination">
              <span className="user-choice__destination-eyebrow">
                {currentDestination.eyebrow}
              </span>

              <h2 className="user-choice__destination-title">
                {currentDestination.title}
              </h2>

              <p className="user-choice__destination-description">
                {currentDestination.description}
              </p>

              <div className="user-choice__destination-services">
                <h3>Come può aiutarti Fulvio</h3>

                <div className="user-choice__destination-list">
                  {currentDestination.services.map((service) => (
                    <div
                      className="user-choice__destination-item"
                      key={service}
                    >
                      <div className="user-choice__check">
                        <Check size={16} />
                      </div>

                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentDestination.note && (
                <div className="user-choice__destination-note">
                  <strong>Non sei sicuro?</strong>

                  <p>{currentDestination.note}</p>
                </div>
              )}

              <div className="user-choice__destination-contact">
                <span>Vuoi approfondire questa situazione?</span>

                <a
                  href={createWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="user-choice__whatsapp"
                >
                  <MessageCircle size={20} />
                  Parla con Fulvio su WhatsApp
                </a>

                <small>
                  Il messaggio includerà automaticamente la richiesta che hai
                  selezionato.
                </small>
              </div>
            </div>
          </div>
        )}
    </section>
  );
};

export default UserChoice;
