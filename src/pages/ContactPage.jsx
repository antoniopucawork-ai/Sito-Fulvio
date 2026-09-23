import { Building2, UserRound, MessageCircle, ArrowRight } from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { contactConfig } from "../data/contactConfig.js";
import "./ContactPage.css";

const ContactPage = () => {
  const createWhatsappUrl = (userType) => {
    const message =
      userType === "azienda"
        ? `Buongiorno Fulvio, arrivo dal suo sito.

La contatto per un'esigenza relativa alla mia azienda.

Avrei bisogno di informazioni su:`
        : `Buongiorno Fulvio, arrivo dal suo sito.

La contatto come privato.

Avrei bisogno di informazioni su:`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

  const createGenericWhatsappUrl = () => {
    const message = `Buongiorno Fulvio, arrivo dal suo sito.

Avrei bisogno di informazioni e vorrei descriverle brevemente la mia situazione:`;

    return `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  };

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

        {/* SCELTA */}

        <section className="contact-choice">
          <div className="contact-choice__header">
            <span>COME POSSO AIUTARTI?</span>

            <h2>Scegli da dove vuoi partire</h2>

            <p>
              Il messaggio WhatsApp sarà già impostato per aiutarti a descrivere
              la tua richiesta.
            </p>
          </div>

          <div className="contact-choice__grid">
            <article className="contact-card">
              <div className="contact-card__icon">
                <Building2 size={28} />
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
                <ArrowRight size={18} />
              </a>
            </article>

            <article className="contact-card">
              <div className="contact-card__icon">
                <UserRound size={28} />
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
                <ArrowRight size={18} />
              </a>
            </article>
          </div>
        </section>

        {/* CONTATTO GENERICO */}

        <section className="contact-direct">
          <div className="contact-direct__content">
            <MessageCircle size={34} className="contact-direct__icon" />

            <span>NON SAI QUALE SERVIZIO SCEGLIERE?</span>

            <h2>Descrivi direttamente la tua situazione.</h2>

            <p>
              Se non sai in quale area rientra la tua esigenza, puoi scrivere
              direttamente a Fulvio e spiegare brevemente ciò di cui hai
              bisogno.
            </p>

            <a
              href={createGenericWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-direct__button"
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

export default ContactPage;
