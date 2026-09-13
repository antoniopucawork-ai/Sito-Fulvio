import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";
import logoFulvio from "../../assets/logo-fulvio.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="/" className="navbar__brand">
          <img
            src={logoFulvio}
            alt="Fulvio Martello"
            className="navbar__logo"
          />

          <div className="navbar__brand-text">
            <span className="navbar__name">FULVIO MARTELLO</span>
            <span className="navbar__subtitle">Consulente del Lavoro</span>
          </div>
        </a>

        <button
          className="navbar__menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="navbar__mobile-menu">
          <a href="/">Home</a>
          <a href="/servizi">Servizi</a>
          <a href="/sicurezza">Sicurezza sul lavoro</a>
          <a href="/formazione">Formazione</a>
          <a href="/privati">Servizi per privati</a>
          <a href="/chi-sono">Chi sono</a>
          <a href="/contatti">Contatti</a>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
