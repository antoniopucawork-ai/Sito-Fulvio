import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

import { Link } from "react-router-dom";

import { professionalProfile } from "../../data/professionalProfile.js";

import "./Hero.css";

const serviceHighlights = [
  {
    id: "lavoro",
    icon: BriefcaseBusiness,
    title: "Lavoro",
    description: "Consulenza e gestione",
  },
  {
    id: "sicurezza",
    icon: ShieldCheck,
    title: "Sicurezza",
    description: "Prevenzione e adempimenti",
  },
  {
    id: "formazione",
    icon: GraduationCap,
    title: "Formazione",
    description: "Corsi e aggiornamenti",
  },
];

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__main">
        <div className="hero__content">
          {/* IDENTITÀ PROFESSIONALE */}

          <div className="hero__identity">
            <span className="hero__professional-name">
              {professionalProfile.name}
            </span>

            <span className="hero__eyebrow">
              Consulente del lavoro · Sicurezza · Formazione
            </span>
          </div>

          {/* TITOLO */}

          <h1 className="hero__title">
            Soluzioni professionali,
            <span> spiegate in modo semplice.</span>
          </h1>

          {/* DESCRIZIONE */}

          <p className="hero__description">
            Consulenza del lavoro, sicurezza e formazione per aziende e privati.
            Ti aiutiamo a capire cosa ti serve e a trovare la soluzione giusta.
          </p>

          {/* AZIONI */}

          <div className="hero__actions">
            <a href="#user-choice" className="hero__primary-button">
              Trova ciò che ti serve
              <ArrowRight size={19} aria-hidden="true" />
            </a>

            <Link to="/servizi" className="hero__secondary-link">
              Vedi tutti i servizi
            </Link>
          </div>
        </div>

        {/* SERVIZI IN EVIDENZA */}

        <div className="hero__highlights">
          {serviceHighlights.map((service) => {
            const Icon = service.icon;

            return (
              <div key={service.id} className="hero__highlight">
                <div className="hero__highlight-top">
                  <Icon
                    size={30}
                    className="hero__highlight-icon"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERCORSO GUIDATO */}

      <a href="#user-choice" className="hero__guide">
        <div>
          <span>Non sai da dove iniziare?</span>

          <strong>Ti guidiamo noi.</strong>
        </div>

        <div className="hero__guide-action">
          <span>Inizia il percorso</span>

          <ArrowRight size={18} aria-hidden="true" />
        </div>
      </a>
    </section>
  );
};

export default Hero;
