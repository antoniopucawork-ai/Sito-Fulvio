import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  GraduationCap,
  MapPin,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <>
      <Navbar />

      <main className="about">
        {/* HERO */}
        <section className="about__hero">
          <div className="about__hero-inner">
            <div className="about__intro">
              <span className="about__eyebrow">Chi sono</span>

              <h1 className="about__title">
                Esperienza, competenza
                <span> e un approccio diretto.</span>
              </h1>
            </div>

            <div className="about__hero-text">
              <p>
                Sono il <strong>Dott. Fulvio Martello</strong>, consulente del
                lavoro e consulente per la sicurezza nei luoghi di lavoro.
              </p>

              <p>
                Affianco aziende e privati con un obiettivo semplice: capire
                l'esigenza, spiegare con chiarezza cosa serve e individuare la
                soluzione più adatta.
              </p>

              <div className="about__location">
                <MapPin size={18} />
                <span>
                  Studio a San Giorgio a Cremano · Assistenza in tutta Italia
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PERCORSO */}
        <section className="about__story">
          <div className="about__story-inner">
            <div className="about__section-heading">
              <span className="about__eyebrow">Il mio percorso</span>

              <h2>
                Una professione costruita
                <span> sul campo.</span>
              </h2>
            </div>

            <div className="about__story-content">
              <div className="about__story-item">
                <span className="about__story-number">01</span>

                <div>
                  <h3>Le prime esperienze</h3>

                  <p>
                    Il mio percorso nel mondo della consulenza è iniziato a 18
                    anni all'interno di uno studio di commercialisti. È qui che
                    ho iniziato a conoscere da vicino il mondo delle aziende e
                    della contabilità.
                  </p>
                </div>
              </div>

              <div className="about__story-item">
                <span className="about__story-number">02</span>

                <div>
                  <h3>La consulenza del lavoro</h3>

                  <p>
                    Dal 2020 ho scelto di specializzarmi nella consulenza del
                    lavoro, costruendo un percorso professionale dedicato alle
                    esigenze di aziende e lavoratori.
                  </p>
                </div>
              </div>

              <div className="about__story-item">
                <span className="about__story-number">03</span>

                <div>
                  <h3>Sicurezza e formazione</h3>

                  <p>
                    Nel tempo ho affiancato alla consulenza del lavoro una
                    formazione specifica nella sicurezza, diventando RSPP
                    interno ed esterno e docente abilitato per la formazione
                    sulla sicurezza nei luoghi di lavoro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPETENZE */}
        <section className="about__expertise">
          <div className="about__expertise-inner">
            <div className="about__section-heading">
              <span className="about__eyebrow">Competenze</span>

              <h2>
                Più aree,
                <span> un unico riferimento.</span>
              </h2>

              <p>
                Sono laureato in Economia e Commercio e iscritto all'Albo dei
                Consulenti del Lavoro.
              </p>
            </div>

            <div className="about__expertise-list">
              <div className="about__expertise-item">
                <BriefcaseBusiness size={24} />

                <div>
                  <h3>Consulenza del lavoro</h3>
                  <p>Supporto professionale per aziende e lavoratori.</p>
                </div>
              </div>

              <div className="about__expertise-item">
                <ShieldCheck size={24} />

                <div>
                  <h3>Sicurezza sul lavoro</h3>
                  <p>
                    Consulenza, prevenzione e incarichi RSPP interni ed esterni.
                  </p>
                </div>
              </div>

              <div className="about__expertise-item">
                <GraduationCap size={24} />

                <div>
                  <h3>Formazione</h3>
                  <p>
                    Docenza e formazione nell'ambito della sicurezza nei luoghi
                    di lavoro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about__cta">
          <div className="about__cta-inner">
            <div>
              <span className="about__eyebrow">Parliamone</span>

              <h2>
                Partiamo dalla
                <span> tua esigenza.</span>
              </h2>

              <p>
                Ogni situazione è diversa. Raccontami di cosa hai bisogno e
                troviamo insieme il percorso più adatto.
              </p>
            </div>

            <div className="about__cta-actions">
              <Link to="/contatti" className="about__primary-button">
                Contatta il Dott. Fulvio Martello
                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
