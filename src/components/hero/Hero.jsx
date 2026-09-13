import { ArrowRight } from "lucide-react";
import "./Hero.css";

const Hero = () => {
  return (
    <main className="hero">
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

        <a href="#user-choice" className="hero__primary-button">
          Trova ciò che ti serve
          <ArrowRight size={19} />
        </a>

        <a href="/servizi" className="hero__secondary-link">
          Vedi tutti i servizi
        </a>
      </div>

      <div className="hero__guide">
        <span>Non sai da dove iniziare?</span>
        <strong>Ti guidiamo noi.</strong>
      </div>
    </main>
  );
};

export default Hero;
