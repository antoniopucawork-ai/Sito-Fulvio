import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { contactConfig } from "../../data/contactConfig";
import "./Footer.css";

const Footer = () => {
  const whatsappUrl = `${contactConfig.whatsappBaseUrl}${contactConfig.whatsappNumber}?text=${encodeURIComponent(
    "Salve, vorrei ricevere maggiori informazioni sui servizi disponibili.",
  )}`;

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <Link to="/" className="footer__name">
            Fulvio Martello
          </Link>

          <p className="footer__role">Consulente del Lavoro</p>

          <p className="footer__description">
            Consulenza del lavoro, sicurezza, formazione e supporto per aziende
            e privati.
          </p>
        </div>

        <div className="footer__column">
          <h2 className="footer__title">Navigazione</h2>

          <nav className="footer__links" aria-label="Navigazione footer">
            <Link to="/servizi">Servizi</Link>
            <Link to="/sicurezza-sul-lavoro">Sicurezza sul lavoro</Link>
            <Link to="/formazione">Formazione</Link>
            <Link to="/servizi-per-privati">Servizi per privati</Link>
          </nav>
        </div>

        <div className="footer__column">
          <h2 className="footer__title">Informazioni</h2>

          <div className="footer__links">
            <Link to="/chi-sono">Chi sono</Link>
            <Link to="/contatti">Contatti</Link>
          </div>
        </div>

        <div className="footer__contact">
          <h2 className="footer__title">Hai bisogno di assistenza?</h2>

          <p>
            Racconta brevemente la tua esigenza e verrai indirizzato verso il
            servizio più adatto.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__whatsapp"
          >
            <MessageCircle size={18} />
            Contatta su WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © {new Date().getFullYear()} Fulvio Martello. Tutti i diritti
          riservati.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
