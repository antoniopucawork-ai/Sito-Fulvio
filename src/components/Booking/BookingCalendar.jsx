import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

import { bookingConfig } from "../../data/bookingConfig";
import "./BookingCalendar.css";

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const monthFormatter = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const getToday = () => {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startingDay = (firstDay.getDay() + 6) % 7;

  return {
    daysInMonth,
    startingDay,
  };
};

const isWorkingDay = (date) => {
  return bookingConfig.officeHours.workingDays.includes(date.getDay());
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

const generateTimeSlots = (duration) => {
  const { morning, afternoon } = bookingConfig.officeHours;

  const periods = [morning, afternoon];

  const slots = [];

  periods.forEach((period) => {
    const start = timeToMinutes(period.start);
    const end = timeToMinutes(period.end);

    for (let current = start; current + duration <= end; current += duration) {
      slots.push(minutesToTime(current));
    }
  });

  return slots;
};

const BookingCalendar = ({
  appointmentType,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) => {
  const today = getToday();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { daysInMonth, startingDay } = getMonthDays(year, month);

  const timeSlots = appointmentType
    ? generateTimeSlots(appointmentType.duration)
    : [];

  const isPastDate = (date) => {
    return date < today;
  };

  const isDateDisabled = (date) => {
    return isPastDate(date) || !isWorkingDay(date);
  };

  const isSelectedDate = (date) => {
    if (!selectedDate) return false;

    return (
      selectedDate.getFullYear() === date.getFullYear() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getDate() === date.getDate()
    );
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    onDateChange(date);
    onTimeChange(null);
  };

  const handlePreviousMonth = () => {
    const previousMonth = new Date(year, month - 1, 1);

    const firstCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    if (previousMonth < firstCurrentMonth) return;

    setCurrentMonth(previousMonth);
    onDateChange(null);
    onTimeChange(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));

    onDateChange(null);
    onTimeChange(null);
  };

  const isPreviousMonthDisabled =
    year === today.getFullYear() && month === today.getMonth();

  const calendarCells = [
    ...Array(startingDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1),
    ),
  ];

  return (
    <section className="booking-calendar">
      <div className="booking-calendar__heading">
        <span className="booking-page__step">PASSAGGIO 02</span>

        <h2>Scegli la data e l'orario</h2>

        <p>
          Seleziona il giorno e l'orario che preferisci per la tua consulenza.
        </p>
      </div>

      <div className="booking-calendar__layout">
        {/* CALENDARIO */}
        <div className="booking-calendar__card">
          <div className="booking-calendar__navigation">
            <h3>
              <CalendarDays size={20} />
              {monthFormatter.format(currentMonth)}
            </h3>

            <div className="booking-calendar__arrows">
              <button
                type="button"
                onClick={handlePreviousMonth}
                disabled={isPreviousMonthDisabled}
                aria-label="Mese precedente"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Mese successivo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="booking-calendar__weekdays">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="booking-calendar__days">
            {calendarCells.map((date, index) => {
              if (!date) {
                return (
                  <span
                    key={`empty-${index}`}
                    className="booking-calendar__empty"
                  />
                );
              }

              const disabled = isDateDisabled(date);
              const selected = isSelectedDate(date);

              return (
                <button
                  key={`${year}-${month}-${date.getDate()}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDateClick(date)}
                  className={`booking-calendar__day ${
                    selected ? "booking-calendar__day--selected" : ""
                  }`}
                  aria-pressed={selected}
                  aria-label={dateFormatter.format(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="booking-calendar__legend">
            <span>
              <i className="booking-calendar__legend-dot" />
              Giorno selezionabile
            </span>

            <span>
              <i className="booking-calendar__legend-dot booking-calendar__legend-dot--disabled" />
              Non selezionabile
            </span>
          </div>
        </div>

        {/* ORARI */}
        <div className="booking-calendar__card">
          <div className="booking-calendar__times-heading">
            <Clock3 size={22} />

            <h3>Orari richiedibili</h3>
          </div>

          {!selectedDate ? (
            <div className="booking-calendar__placeholder">
              <CalendarDays size={34} />

              <p>
                Seleziona un giorno dal calendario per visualizzare gli orari.
              </p>
            </div>
          ) : (
            <>
              <p className="booking-calendar__selected-date">
                {dateFormatter.format(selectedDate)}
              </p>

              <div className="booking-calendar__time-grid">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeChange(time)}
                    className={`booking-calendar__time ${
                      selectedTime === time
                        ? "booking-calendar__time--selected"
                        : ""
                    }`}
                    aria-pressed={selectedTime === time}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="booking-calendar__summary">
          <CalendarDays size={22} />

          <div>
            <span>Data e orario richiesti</span>

            <strong>
              {dateFormatter.format(selectedDate)} alle {selectedTime}
            </strong>
          </div>
        </div>
      )}

      <p className="booking-calendar__disclaimer">
        Gli orari visualizzati sono indicativi e soggetti alla disponibilità del
        professionista. L'appuntamento sarà effettivo soltanto dopo la conferma
        del Dott. Fulvio Martello.
      </p>
    </section>
  );
};

export default BookingCalendar;
