import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Mail, ExternalLink } from "lucide-react";

import Navbar from "../../components/Navbar/Navbar.jsx";
import { contactConfig } from "../../data/contactConfig.js";

import "./PrivacyPage.css";

const privacySections = [
  {
    id: "dati",
    number: "02",
    title: "Quali dati vengono trattati",
    paragraphs: [
      "Durante la navigazione, i sistemi informatici utilizzati per il funzionamento del sito possono acquisire dati tecnici, come l'indirizzo IP, le informazioni sul browser e i dati relativi alle richieste effettuate al server.",
      "Quando un visitatore contatta volontariamente lo studio tramite email, telefono o WhatsApp, vengono trattati i dati personali comunicati per consentire la gestione della richiesta.",
      "Il sito non dispone attualmente di un modulo di registrazione o di un'area riservata agli utenti.",
    ],
  },
  {
    id: "finalita",
    number: "03",
    title: "Finalità e basi giuridiche",
    paragraphs: [
      "I dati personali sono trattati per consentire il funzionamento tecnico del sito, garantirne la sicurezza e gestire le richieste di informazioni o consulenza inviate dagli utenti.",
      "La gestione delle richieste di consulenza può basarsi sull'esecuzione di misure precontrattuali adottate su richiesta dell'interessato, ai sensi dell'articolo 6, paragrafo 1, lettera b), del Regolamento (UE) 2016/679.",
      "Per le attività tecniche necessarie alla sicurezza del sito può essere applicabile il legittimo interesse del titolare, ai sensi dell'articolo 6, paragrafo 1, lettera f), nel rispetto delle condizioni previste dalla normativa.",
      "Gli eventuali trattamenti connessi a un successivo rapporto professionale sono disciplinati dalle informative applicabili a tale rapporto.",
    ],
  },
  {
    id: "comunicazioni",
    number: "04",
    title: "Contatti e comunicazioni",
    paragraphs: [
      "Gli utenti possono contattare lo studio attraverso i recapiti telefonici, l'indirizzo email professionale e il collegamento a WhatsApp presenti sul sito.",
      "I dati comunicati volontariamente vengono utilizzati per esaminare la richiesta e fornire un riscontro.",
      "Si invita a non trasmettere informazioni particolarmente riservate attraverso i collegamenti di contatto prima di aver concordato con lo studio una modalità di comunicazione adeguata.",
    ],
  },
  {
    id: "servizi-esterni",
    number: "05",
    title: "Servizi e collegamenti esterni",
    paragraphs: [
      "Il sito contiene collegamenti a servizi di terze parti, tra cui WhatsApp e Google Maps.",
      "Se l'utente sceglie di aprire tali collegamenti, accede a piattaforme esterne che gestiscono i dati secondo le proprie informative sulla privacy.",
      "Il sito utilizza inoltre un servizio di hosting per rendere disponibili le pagine e gestire le richieste tecniche necessarie alla navigazione.",
    ],
  },
  {
    id: "cookie",
    number: "06",
    title: "Cookie e tecnologie analoghe",
    paragraphs: [
      "Il sito non integra, nel codice applicativo attualmente utilizzato, strumenti di profilazione pubblicitaria o servizi di analisi statistica dei visitatori.",
      "L'eventuale utilizzo di cookie tecnici o di altre tecnologie da parte dell'infrastruttura di hosting deve essere valutato in relazione alla configurazione effettivamente adottata.",
    ],
  },
  {
    id: "conservazione",
    number: "07",
    title: "Conservazione e protezione dei dati",
    paragraphs: [
      "I dati personali devono essere conservati per un periodo proporzionato alle finalità per cui vengono trattati e agli eventuali obblighi previsti dalla legge.",
      "I tempi o i criteri specifici di conservazione delle comunicazioni ricevute dallo studio devono essere definiti in base alle modalità effettive di gestione delle richieste.",
      "Il trattamento dei dati deve avvenire mediante misure tecniche e organizzative adeguate a proteggerli da accessi non autorizzati, perdita o utilizzi impropri.",
    ],
  },
  {
    id: "diritti",
    number: "08",
    title: "Diritti degli interessati",
    paragraphs: [
      "Ai sensi del Regolamento (UE) 2016/679, gli interessati possono esercitare, nei casi previsti, i diritti di accesso, rettifica, cancellazione, limitazione del trattamento, portabilità dei dati e opposizione.",
      "Gli interessati possono inoltre proporre reclamo al Garante per la protezione dei dati personali.",
      "Le richieste relative all'esercizio dei diritti possono essere indirizzate ai recapiti professionali indicati nella presente pagina, previa conferma del titolare del trattamento.",
    ],
  },
  {
    id: "aggiornamenti",
    number: "09",
    title: "Aggiornamenti dell'informativa",
    paragraphs: [
      "Il contenuto della presente informativa può essere aggiornato in seguito a modifiche delle funzionalità del sito, delle modalità di trattamento dei dati o della normativa applicabile.",
    ],
  },
];

const PrivacyPage = () => {
  const { professionalName, email, pec, address, vatNumber } = contactConfig;

  return (
    <>
      <Navbar />

      <main className="privacy-page">
        <section className="privacy-hero">
          <div className="privacy-container">
            <Link to="/" className="privacy-back">
              <ArrowLeft size={17} aria-hidden="true" />
              Torna alla Home
            </Link>

            <div className="privacy-hero__heading">
              <ShieldCheck
                size={28}
                aria-hidden="true"
                className="privacy-hero__icon"
              />

              <span className="privacy-eyebrow">
                TRASPARENZA E RISERVATEZZA
              </span>

              <h1>Privacy Policy</h1>

              <p>
                Informazioni sul trattamento dei dati personali degli utenti che
                visitano il sito e contattano lo studio del Dott. Fulvio
                Martello.
              </p>
            </div>
          </div>
        </section>

        <section className="privacy-content">
          <div className="privacy-container">
            <section
              className="privacy-section"
              aria-labelledby="privacy-titolare"
            >
              <span className="privacy-section__number">01</span>

              <div>
                <h2 id="privacy-titolare">Titolare del trattamento</h2>

                <p>
                  Di seguito sono riportati i dati identificativi e i recapiti
                  professionali dello studio, da verificare ai fini
                  dell'individuazione del titolare del trattamento.
                </p>

                <address>
                  <strong>{professionalName}</strong>
                  <br />
                  {address.street}
                  <br />
                  {address.postalCode} {address.city} ({address.province})
                  <br />
                  P. IVA: {vatNumber}
                  <br />
                  Email: <a href={`mailto:${email}`}>{email}</a>
                  <br />
                  PEC: <a href={`mailto:${pec}`}>{pec}</a>
                </address>
              </div>
            </section>

            {privacySections.map((section) => (
              <section
                key={section.id}
                className="privacy-section"
                aria-labelledby={`privacy-${section.id}`}
              >
                <span className="privacy-section__number">
                  {section.number}
                </span>

                <div>
                  <h2 id={`privacy-${section.id}`}>{section.title}</h2>

                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="privacy-contact">
              <Mail size={23} aria-hidden="true" />

              <h2>Informazioni sulla privacy</h2>

              <p>
                Per richieste relative al trattamento dei dati personali puoi
                contattare lo studio attraverso l'indirizzo email professionale.
              </p>

              <a href={`mailto:${email}`}>
                {email}
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PrivacyPage;
