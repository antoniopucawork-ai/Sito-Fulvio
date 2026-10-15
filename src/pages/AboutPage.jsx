import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  GraduationCap,
  MapPin,
} from "lucide-react";

import Navbar from "../components/Navbar/Navbar.jsx";
import { professionalProfile } from "../data/professionalProfile.js";
import { contactConfig } from "../data/contactConfig.js";

import "./AboutPage.css";

const professionalAreas = [
  {
    id: "labor",
    title: "Consulenza del lavoro",
    description:
      "Supporto ad aziende e lavoratori nelle questioni legate ai rapporti di lavoro, alla gestione del personale e agli adempimenti connessi.",
  },
  {
    id: "safety",
    title: "Salute e sicurezza sul lavoro",
    description:
      "Consulenza in materia di salute e sicurezza nei luoghi di lavoro, con competenze RSPP e attenzione alle esigenze delle diverse attività aziendali.",
  },
  {
    id: "training",
    title: "Formazione per la sicurezza",
    description:
      "Attività di formazione per la sicurezza sui luoghi di lavoro, con percorsi rivolti alle figure coinvolte nella prevenzione e nella gestione dei rischi.",
  },
];

const qualificationIcons = {
  labor: BriefcaseBusiness,
  safety: ShieldCheck,
  rspp: ShieldCheck,
  training: GraduationCap,
};

const AboutPage = () => {
  const { name, qualifications } = professionalProfile;
  const { address } = contactConfig;

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
                Competenza, attenzione
                <span> e un approccio diretto.</span>
              </h1>
            </div>

            <div className="about__hero-text">
              <p>
                Sono il <strong>{name}</strong>, consulente del lavoro iscritto
                all&apos;Albo dei Consulenti del Lavoro di Napoli, consulente
                della sicurezza e formatore per la sicurezza nei luoghi di
                lavoro.
              </p>

              <p>
                Mi occupo di consulenza del lavoro, salute e sicurezza nei
                luoghi di lavoro e formazione, offrendo supporto ad aziende e
                lavoratori nell&apos;affrontare le proprie esigenze
                professionali.
              </p>

              <div className="about__location">
                <MapPin size={18} aria-hidden="true" />

                <span>
                  Studio a {address.city} · Consulenze in tutta Italia
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AMBITI PROFESSIONALI */}

        <section className="about__story">
          <div className="about__story-inner">
            <div className="about__section-heading">
              <span className="about__eyebrow">Ambiti di attività</span>

              <h2>
                Competenze diverse,
                <span> un approccio integrato.</span>
              </h2>
            </div>

            <div className="about__story-content">
              {professionalAreas.map((area) => {
                const Icon =
                  qualificationIcons[area.id] || BriefcaseBusiness;

                return (
                <div className="about__story-item" key={area.id}>
                  <Icon
                    size={30}
                    className="about__story-icon"
                    aria-hidden="true"
                  />

                  <div>
                    <h3>{area.title}</h3>

                    <p>{area.description}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* QUALIFICHE PROFESSIONALI */}

        <section className="about__expertise">
          <div className="about__expertise-inner">
            <div className="about__section-heading">
              <span className="about__eyebrow">Qualifiche professionali</span>

              <h2>
                Preparazione e competenze
                <span> al servizio del lavoro.</span>
              </h2>

              <p>
                Consulenza del lavoro, sicurezza e formazione: qualifiche
                professionali che rappresentano i principali ambiti della mia
                attività.
              </p>
            </div>

            <div className="about__expertise-list">
              {qualifications.map((qualification) => {
                const Icon =
                  qualificationIcons[qualification.id] || BriefcaseBusiness;

                return (
                  <div className="about__expertise-item" key={qualification.id}>
                    <Icon size={24} aria-hidden="true" />

                    <div>
                      <h3>{qualification.title}</h3>

                      <p>{qualification.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTATTI */}

        <section className="about__cta">
          <div className="about__cta-inner">
            <div>
              <span className="about__eyebrow">Parliamone</span>

              <h2>
                Partiamo dalla
                <span> tua esigenza.</span>
              </h2>

              <p>
                Ogni situazione richiede attenzione. Raccontami di cosa hai
                bisogno e individuiamo insieme il percorso più adatto.
              </p>
            </div>

            <div className="about__cta-actions">
              <Link to="/contatti" className="about__primary-button">
                Contatta il Dott. Fulvio Martello
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
