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

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* BRAND */}
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

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`navbar__menu-button ${
            isMenuOpen ? "navbar__menu-button--open" : ""
          }`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      <nav
        id="mobile-navigation"
        className={`navbar__mobile-menu ${
          isMenuOpen ? "navbar__mobile-menu--open" : ""
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="navbar__mobile-menu-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              className={({ isActive }) =>
                isActive ? "navbar__mobile-link--active" : ""
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
