import {
  Building2,
  UserRound,
  MessageCircle,
  ArrowRight,
  MapPin,
  Clock3,
  Phone,
  Mail,
  ExternalLink,
  MonitorSmartphone,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { contactConfig } from "../data/contactConfig.js";

import "./ContactPage.css";

const ContactPage = () => {
  const {
    professionalName,
    whatsappNumber,
    whatsappBaseUrl,
    officePhone,
    email,
    pec,
    address,
    officeHours,
    services,
  } = contactConfig;

  const createWhatsappUrl = (userType) => {
    const introduction = `Salve ${professionalName}, arrivo dal suo sito.`;

    const context =
      userType === "azienda"
        ? "La contatto per un'esigenza relativa alla mia azienda."
        : "La contatto come privato.";

    const message = `${introduction}

${context}

Avrei bisogno di informazioni su:

`;

    return `${whatsappBaseUrl}${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  const createGenericWhatsappUrl = () => {
    const message = `Salve ${professionalName}, arrivo dal suo sito.

Avrei bisogno di informazioni e vorrei descriverle brevemente la mia situazione:

`;

    return `${whatsappBaseUrl}${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  const fullAddress = `${address.street}, ${address.postalCode} ${address.city} (${address.province})`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress,
  )}`;

  return (
    <>
      <Navbar />

      <main className="contact-page">
        {/* HERO */}

        <section className="contact-hero">
          <div className="contact-hero__content">
            <span className="contact-hero__eyebrow">CONTATTI</span>

            <h1 className="contact-hero__title">
              Racconta la tua esigenza.
              <span> Partiamo da lì.</span>
            </h1>

            <p className="contact-hero__description">
              Non è necessario conoscere già il nome del servizio o della
              pratica. Indica semplicemente se stai cercando supporto per
              un&apos;azienda o come privato e descrivi brevemente la tua
              situazione.
            </p>
          </div>
        </section>

        {/* SCELTA DEL TIPO DI CONTATTO */}

        <section className="contact-choice">
          <div className="contact-choice__header">
            <span>COME POSSO AIUTARTI?</span>

            <h2>Scegli da dove vuoi partire</h2>

            <p>
              Il messaggio WhatsApp sarà già impostato. Ti basterà completarlo
              con una breve descrizione della tua richiesta prima di inviarlo.
            </p>
          </div>

          <div className="contact-choice__grid">
            {/* AZIENDE */}

            <article className="contact-card">
              <div className="contact-card__icon">
                <Building2 size={28} aria-hidden="true" />
              </div>

              <span>PER LE AZIENDE</span>

              <h3>Ho un&apos;esigenza aziendale</h3>

              <p>
                Per richieste relative a personale, sicurezza, formazione,
                consulenza fiscale e societaria e agli altri servizi dedicati
                alle aziende.
              </p>

              <a
                href={createWhatsappUrl("azienda")}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card__button"
              >
                Scrivi su WhatsApp
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </article>

            {/* PRIVATI */}

            <article className="contact-card">
              <div className="contact-card__icon">
                <UserRound size={28} aria-hidden="true" />
              </div>

              <span>PER I PRIVATI</span>

              <h3>Ho un&apos;esigenza personale</h3>

              <p>
                Per richieste relative a lavoro, previdenza, pratiche, sicurezza
                e agli altri servizi dedicati ai privati.
              </p>

              <a
                href={createWhatsappUrl("privato")}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card__button"
              >
                Scrivi su WhatsApp
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </article>
          </div>
        </section>

        {/* CONTATTO GENERICO */}

        <section className="contact-direct">
          <div className="contact-direct__content">
            <MessageCircle
              size={34}
              className="contact-direct__icon"
              aria-hidden="true"
            />

            <span>NON SAI QUALE SERVIZIO SCEGLIERE?</span>

            <h2>Descrivi direttamente la tua situazione.</h2>

            <p>
              Se non sai in quale area rientra la tua esigenza, puoi scrivere
              direttamente al {professionalName} e spiegare brevemente ciò di
              cui hai bisogno.
            </p>

            <a
              href={createGenericWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-direct__button"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Contatta il {professionalName}
            </a>
          </div>
        </section>

        {/* STUDIO E CONTATTI */}

        <section className="contact-studio">
          <div className="contact-studio__inner">
            <div className="contact-studio__heading">
              <span className="contact-studio__eyebrow">LO STUDIO</span>

              <h2>
                Un riferimento vicino.
                <span> Anche a distanza.</span>
              </h2>

              <p>
                Lo studio del {professionalName} si trova a {address.city}, in
                provincia di Napoli.
                {services.remoteConsultations && (
                  <>
                    {" "}
                    Le consulenze sono disponibili anche a distanza, per
                    assistere clienti su tutto il territorio nazionale.
                  </>
                )}
              </p>
            </div>

            <div className="contact-studio__grid">
              {/* INDIRIZZO */}

              <article className="contact-studio__card">
                <MapPin size={26} aria-hidden="true" />

                <h3>Dove siamo</h3>

                <address>
                  {address.street}
                  <br />
                  {address.postalCode} {address.city}
                  <br />({address.province})
                </address>

                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Come raggiungere lo studio
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </article>

              {/* ORARI */}

              <article className="contact-studio__card">
                <Clock3 size={26} aria-hidden="true" />

                <h3>Orari dello studio</h3>

                <p>
                  Mattina
                  <strong>{officeHours.morning}</strong>
                </p>

                <p>
                  Pomeriggio
                  <strong>{officeHours.afternoon}</strong>
                </p>

                {officeHours.appointmentOnly && (
                  <span className="contact-studio__note">
                    Ricevimento su appuntamento.
                  </span>
                )}
              </article>

              {/* TELEFONO */}

              <article className="contact-studio__card">
                <Phone size={26} aria-hidden="true" />

                <h3>Telefono</h3>

                <p>
                  Per informazioni e appuntamenti puoi contattare direttamente
                  lo studio.
                </p>

                <a href={`tel:${officePhone}`}>
                  {officePhone}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>

              {/* CONSULENZE A DISTANZA */}

              {services.remoteConsultations && (
                <article className="contact-studio__card">
                  <MonitorSmartphone size={26} aria-hidden="true" />

                  <h3>Consulenze a distanza</h3>

                  <p>
                    Non è necessario recarsi sempre in studio. È possibile
                    richiedere una consulenza anche a distanza, previo
                    appuntamento.
                  </p>

                  <a
                    href={createGenericWhatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Richiedi informazioni
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </article>
              )}
            </div>

            {/* EMAIL E PEC */}

            <div className="contact-studio__emails">
              <div>
                <Mail size={20} aria-hidden="true" />

                <div>
                  <span>Email</span>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              </div>

              <div>
                <Mail size={20} aria-hidden="true" />

                <div>
                  <span>PEC</span>
                  <a href={`mailto:${pec}`}>{pec}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ContactPage;
