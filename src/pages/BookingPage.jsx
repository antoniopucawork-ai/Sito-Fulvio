import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Video, Building2 } from "lucide-react";

import { bookingConfig } from "../data/bookingConfig";
import BookingCalendar from "../components/Booking/BookingCalendar";
import BookingForm from "../components/Booking/BookingForm";
import { createBookingRequest } from "../services/bookingService";
import "./BookingPage.css";

const appointmentIcons = {
  video: Video,
  studio: MapPin,
  azienda: Building2,
};

const BookingPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleBookingSubmit = async (bookingData) => {
    return await createBookingRequest(bookingData);
  };

  return (
    <main className="booking-page">
      {/* INTRODUZIONE */}
      <section className="booking-page__hero">
        <div className="booking-page__container">
          <span className="booking-page__eyebrow">
            CONSULENZE SU APPUNTAMENTO
          </span>

          <h1>{bookingConfig.title}</h1>

          <p>{bookingConfig.description}</p>
        </div>
      </section>

      {/* SISTEMA DI PRENOTAZIONE */}
      <section className="booking-page__content">
        <div className="booking-page__container">
          {/* PASSAGGIO 01 */}
          <div className="booking-page__intro">
            <span className="booking-page__step">PASSAGGIO 01</span>

            <h2>Come preferisci effettuare la consulenza?</h2>

            <p>
              Seleziona la modalità che preferisci. Successivamente potrai
              scegliere il giorno e l'orario.
            </p>
          </div>

          {/* MODALITÀ */}
          <div className="booking-page__options">
            {bookingConfig.appointmentTypes.map((type) => {
              const Icon = appointmentIcons[type.id];
              const isSelected = selectedType?.id === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  className={`booking-page__option ${
                    isSelected ? "booking-page__option--selected" : ""
                  }`}
                  onClick={() => handleSelectType(type)}
                  aria-pressed={isSelected}
                >
                  <div className="booking-page__option-icon">
                    <Icon size={28} />
                  </div>

                  <h3>{type.title}</h3>

                  <p>{type.description}</p>

                  <div className="booking-page__duration">
                    <Clock3 size={16} />

                    <span>Durata indicativa: {type.duration} minuti</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MODALITÀ SELEZIONATA */}
          {selectedType && (
            <div className="booking-page__selection">
              <div>
                <span>Modalità selezionata</span>
                <strong>{selectedType.title}</strong>
              </div>

              <p>Scegli la data e l'orario che preferisci per la consulenza.</p>
            </div>
          )}

          {/* PASSAGGIO 02: CALENDARIO */}
          {selectedType && (
            <BookingCalendar
              appointmentType={selectedType}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />
          )}

          {/* PASSAGGIO 03: MODULO */}
          {selectedType && selectedDate && selectedTime && (
            <>
              <div className="booking-page__selection">
                <div>
                  <span>Riepilogo appuntamento</span>
                  <strong>{selectedType.title}</strong>
                </div>

                <p>
                  {selectedDate.toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  alle ore <strong>{selectedTime}</strong>
                </p>
              </div>

              <BookingForm
                appointmentType={selectedType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSubmit={handleBookingSubmit}
                submissionEnabled={import.meta.env.DEV}
              />
            </>
          )}

          {/* AVVISO */}
          <div className="booking-page__notice">
            <CalendarDays size={22} />

            <p>
              La richiesta non costituisce una prenotazione confermata. Ogni
              appuntamento sarà valutato personalmente dal Dott. Fulvio
              Martello.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookingPage;
