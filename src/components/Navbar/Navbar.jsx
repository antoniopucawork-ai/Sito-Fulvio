import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import "./Navbar.css";
import logoFulvio from "../../assets/logo-fulvio.png";

const navItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Servizi",
    path: "/servizi",
  },
  {
    label: "Sicurezza sul lavoro",
    path: "/sicurezza-sul-lavoro",
  },
  {
    label: "Formazione",
    path: "/formazione",
  },
  {
    label: "Servizi per privati",
    path: "/servizi-per-privati",
  },
  {
    label: "Chi sono",
    path: "/chi-sono",
  },
  {
    label: "Contatti",
    path: "/contatti",
  },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <img
            src={logoFulvio}
            alt="Fulvio Martello"
            className="navbar__logo"
          />

          <div className="navbar__brand-text">
            <span className="navbar__name">FULVIO MARTELLO</span>

            <span className="navbar__subtitle">Consulente del Lavoro</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="navbar__desktop-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "navbar__link--active" : ""
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className="navbar__menu-button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <nav className="navbar__mobile-menu">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
