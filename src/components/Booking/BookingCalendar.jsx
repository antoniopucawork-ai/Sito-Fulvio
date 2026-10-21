import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
} from "lucide-react";

import { bookingConfig } from "../../data/bookingConfig";
import { getBookingAvailability } from "../../services/bookingService";
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

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);

  return {
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    startingDay: (firstDay.getDay() + 6) % 7,
  };
};

const isWorkingDay = (date) =>
  bookingConfig.officeHours.workingDays.includes(date.getDay());

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

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { daysInMonth, startingDay } = getMonthDays(year, month);

  const selectedDateKey = selectedDate ? formatDateForApi(selectedDate) : null;

  const appointmentTypeId = appointmentType?.id;

  useEffect(() => {
    if (!selectedDateKey || !appointmentTypeId) return;

    const controller = new AbortController();

    const loadAvailability = async () => {
      setLoading(true);
      setError("");
      setAvailableSlots([]);

      try {
        const slots = await getBookingAvailability(
          selectedDateKey,
          appointmentTypeId,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setAvailableSlots(slots);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Impossibile caricare le disponibilità.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadAvailability();

    return () => controller.abort();
  }, [selectedDateKey, appointmentTypeId]);

  const isDateDisabled = (date) => date < today || !isWorkingDay(date);

  const isSelectedDate = (date) =>
    selectedDate?.getFullYear() === date.getFullYear() &&
    selectedDate?.getMonth() === date.getMonth() &&
    selectedDate?.getDate() === date.getDate();

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    onDateChange(date);
    onTimeChange(null);
  };

  const changeMonth = (offset) => {
    const nextMonth = new Date(year, month + offset, 1);
    const firstCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    if (nextMonth < firstCurrentMonth) return;

    setCurrentMonth(nextMonth);
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
        <div className="booking-calendar__card">
          <div className="booking-calendar__navigation">
            <h3>
              <CalendarDays size={20} />
              {monthFormatter.format(currentMonth)}
            </h3>

            <div className="booking-calendar__arrows">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                disabled={isPreviousMonthDisabled}
                aria-label="Mese precedente"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
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

              {loading && (
                <div className="booking-calendar__placeholder" role="status">
                  <RefreshCw size={25} />
                  <p>Verifica disponibilità in corso...</p>
                </div>
              )}

              {!loading && error && (
                <div className="booking-calendar__placeholder" role="alert">
                  <p>{error}</p>
                  <p>Riprova selezionando nuovamente la data.</p>
                </div>
              )}

              {!loading && !error && availableSlots.length === 0 && (
                <div className="booking-calendar__placeholder">
                  <Clock3 size={28} />
                  <p>Nessun orario disponibile per questa data.</p>
                </div>
              )}

              {!loading && !error && availableSlots.length > 0 && (
                <div className="booking-calendar__time-grid">
                  {availableSlots.map((time) => (
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
              )}
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
        Gli orari visualizzati sono soggetti alla disponibilità del
        professionista. L'appuntamento sarà confermato soltanto dopo
        l'approvazione del Dott. Fulvio Martello.
      </p>
    </section>
  );
};

export default BookingCalendar;
