import { Link } from "react-router-dom";
import {
  CalendarDays,
  Video,
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "./BookingCTA.css";

const appointmentOptions = [
  {
    icon: Video,
    title: "In videochiamata",
    description: "Ricevi una consulenza a distanza.",
  },
  {
    icon: MapPin,
    title: "Presso lo studio",
    description: "Incontra il Dott. Fulvio Martello di persona.",
  },
  {
    icon: Building2,
    title: "Presso la tua azienda",
    description: "Richiedi un incontro direttamente nella tua sede.",
  },
];

const BookingCTA = () => {
  return (
    <section className="booking-cta" aria-labelledby="booking-cta-title">
      <div className="booking-cta__container">
        <div className="booking-cta__content">
          <span className="booking-cta__eyebrow">
            <CalendarDays size={17} aria-hidden="true" />
            CONSULENZE SU APPUNTAMENTO
          </span>

          <h2 id="booking-cta-title">
            Hai bisogno di una <span>consulenza?</span>
          </h2>

          <p className="booking-cta__description">
            Scegli la modalità più comoda per te e richiedi un appuntamento con
            il Dott. Fulvio Martello.
          </p>

          <div className="booking-cta__options">
            {appointmentOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div className="booking-cta__option" key={option.title}>
                  <div className="booking-cta__option-icon">
                    <Icon size={21} aria-hidden="true" />
                  </div>

                  <div>
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="booking-cta__actions">
            <Link to="/prenotazioni" className="booking-cta__button">
              Richiedi un appuntamento
              <ArrowRight size={19} aria-hidden="true" />
            </Link>

            <p className="booking-cta__notice">
              <ShieldCheck size={17} aria-hidden="true" />
              La richiesta sarà valutata personalmente dallo studio.
              L'appuntamento non è confermato automaticamente.
            </p>
          </div>
        </div>

        <div className="booking-cta__visual" aria-hidden="true">
          <div className="booking-cta__visual-circle">
            <CalendarDays size={76} strokeWidth={1.3} />
          </div>

          <span className="booking-cta__visual-label">
            IL TUO PROSSIMO PASSO
          </span>

          <p>Un confronto professionale, quando ne hai bisogno.</p>
        </div>
      </div>
    </section>
  );
};

export default BookingCTA;
