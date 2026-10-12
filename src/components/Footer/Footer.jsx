import { Link } from "react-router-dom";
import { MessageCircle, MapPin, Phone, Mail } from "lucide-react";

import { contactConfig } from "../../data/contactConfig.js";

import "./Footer.css";

const Footer = () => {
  const {
    professionalName,
    whatsappNumber,
    whatsappBaseUrl,
    officePhone,
    email,
    address,
    vatNumber,
    fiscalCode,
    services,
  } = contactConfig;

  const whatsappMessage =
    `Salve ${professionalName}, arrivo dal suo sito. ` +
    `Vorrei ricevere maggiori informazioni sui servizi disponibili.`;

  const whatsappUrl =
    `${whatsappBaseUrl}${whatsappNumber}` +
    `?text=${encodeURIComponent(whatsappMessage)}`;

  const fullAddress =
    `${address.street}, ${address.postalCode} ` +
    `${address.city} (${address.province})`;

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=` +
    encodeURIComponent(fullAddress);

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* PROFESSIONISTA */}

        <div className="footer__brand">
          <Link to="/" className="footer__name">
            {professionalName}
          </Link>

          <p className="footer__role">Consulente del Lavoro</p>

          <p className="footer__description">
            Consulenza del lavoro, sicurezza e formazione per aziende e privati.
          </p>

          {services.remoteConsultations && (
            <p className="footer__description footer__availability">
              Studio a {address.city}. Consulenze disponibili anche a distanza
              {services.nationwide ? " su tutto il territorio nazionale." : "."}
            </p>
          )}
        </div>

        {/* NAVIGAZIONE */}

        <div className="footer__column">
          <h2 className="footer__title">Navigazione</h2>

          <nav className="footer__links" aria-label="Navigazione footer">
            <Link to="/servizi">Servizi</Link>

            <Link to="/sicurezza-sul-lavoro">Sicurezza sul lavoro</Link>

            <Link to="/formazione">Formazione</Link>

            <Link to="/servizi-per-privati">Servizi per privati</Link>
          </nav>
        </div>

        {/* INFORMAZIONI */}

        <div className="footer__column">
          <h2 className="footer__title">Informazioni</h2>

          <div className="footer__links">
            <Link to="/chi-sono">Chi sono</Link>

            <Link to="/contatti">Contatti</Link>

            <Link to="/privacy">Privacy Policy</Link>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__address"
            >
              <MapPin size={16} aria-hidden="true" />

              <span>
                {address.street}
                <br />
                {address.postalCode} {address.city}
                <br />({address.province})
              </span>
            </a>
          </div>
        </div>

        {/* CONTATTI */}

        <div className="footer__contact">
          <h2 className="footer__title">Hai bisogno di assistenza?</h2>

          <p>
            Racconta brevemente la tua esigenza e individuiamo il servizio più
            adatto.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__whatsapp"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Contatta su WhatsApp
          </a>

          <div className="footer__contact-details">
            <a href={`tel:${officePhone}`}>
              <Phone size={16} aria-hidden="true" />
              {officePhone}
            </a>

            <a href={`mailto:${email}`}>
              <Mail size={16} aria-hidden="true" />
              {email}
            </a>
          </div>
        </div>
      </div>

      {/* DATI LEGALI */}

      <div className="footer__bottom">
        <div className="footer__legal">
          <p>
            © {new Date().getFullYear()} {professionalName}. Tutti i diritti
            riservati.
          </p>

          <p>
            P. IVA {vatNumber}
            <span className="footer__separator">·</span>
            C.F. {fiscalCode}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
