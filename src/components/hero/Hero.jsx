import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";

const serviceHighlights = [
  {
    id: "lavoro",
    number: "01",
    icon: BriefcaseBusiness,
    title: "Lavoro",
    description: "Consulenza e gestione",
  },
  {
    id: "sicurezza",
    number: "02",
    icon: ShieldCheck,
    title: "Sicurezza",
    description: "Prevenzione e adempimenti",
  },
  {
    id: "formazione",
    number: "03",
    icon: GraduationCap,
    title: "Formazione",
    description: "Corsi e aggiornamenti",
  },
];

const Hero = () => {
  return (
    <main className="hero">
      <div className="hero__main">
        <div className="hero__content">
          <span className="hero__eyebrow">Lavoro · Sicurezza · Formazione</span>

          <h1 className="hero__title">
            Soluzioni professionali,
            <span> spiegate in modo semplice.</span>
          </h1>

          <p className="hero__description">
            Consulenza del lavoro, sicurezza e formazione per aziende e privati.
            Ti aiutiamo a capire cosa ti serve e a trovare la soluzione giusta.
          </p>

          <div className="hero__actions">
            <a href="#user-choice" className="hero__primary-button">
              Trova ciò che ti serve
              <ArrowRight size={19} />
            </a>

            <Link to="/servizi" className="hero__secondary-link">
              Vedi tutti i servizi
            </Link>
          </div>
        </div>

        <div className="hero__highlights">
          {serviceHighlights.map((service) => {
            const Icon = service.icon;

            return (
              <div key={service.id} className="hero__highlight">
                <div className="hero__highlight-top">
                  <span className="hero__highlight-number">
                    {service.number}
                  </span>

                  <Icon size={23} className="hero__highlight-icon" />
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

      <a href="#user-choice" className="hero__guide">
        <div>
          <span>Non sai da dove iniziare?</span>
          <strong>Ti guidiamo noi.</strong>
        </div>

        <div className="hero__guide-action">
          <span>Inizia il percorso</span>
          <ArrowRight size={18} />
        </div>
      </a>
    </main>
  );
};

export default Hero;
