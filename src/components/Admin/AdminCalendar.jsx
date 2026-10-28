import { useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Video,
  Building2,
} from "lucide-react";

import "./AdminCalendar.css";

// ==========================================
// CONFIGURAZIONE
// ==========================================

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const TYPE_CONFIG = {
  video: {
    label: "Videochiamata",
    icon: Video,
  },
  studio: {
    label: "In studio",
    icon: MapPin,
  },
  azienda: {
    label: "In azienda",
    icon: Building2,
  },
};

// ==========================================
// UTILITY DATE
// ==========================================

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const startOfWeek = (date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const day = (result.getDay() + 6) % 7;

  result.setDate(result.getDate() - day);

  return result;
};

const addDays = (date, days) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
};

const formatTime = (time) => {
  return time ? String(time).slice(0, 5) : "--:--";
};

const formatMonth = (date) => {
  return new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatFullDate = (date) => {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ==========================================
// COMPONENTE
// ==========================================

const AdminCalendar = ({ bookings = [], onSelectBooking }) => {
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // ========================================
  // PRENOTAZIONI VISIBILI
  // ========================================

  const visibleBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "confirmed" || booking.status === "pending",
      )
      .sort((a, b) => {
        const first = `${a.appointment_date}T${a.appointment_time}`;
        const second = `${b.appointment_date}T${b.appointment_time}`;

        return first.localeCompare(second);
      });
  }, [bookings]);

  const bookingsByDate = useMemo(() => {
    const result = new Map();

    visibleBookings.forEach((booking) => {
      const key = booking.appointment_date;

      if (!result.has(key)) {
        result.set(key, []);
      }

      result.get(key).push(booking);
    });

    return result;
  }, [visibleBookings]);

  // ========================================
  // GIORNI DEL CALENDARIO
  // ========================================

  const calendarDays = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(currentDate);

      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    const start = startOfWeek(firstDay);

    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [currentDate, view]);

  // ========================================
  // NAVIGAZIONE
  // ========================================

  const navigate = (direction) => {
    setCurrentDate((previous) => {
      if (view === "week") {
        return addDays(previous, direction * 7);
      }

      return new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1,
      );
    });
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // ========================================
  // RENDER EVENTO
  // ========================================

  const renderBooking = (booking) => {
    const type = TYPE_CONFIG[booking.appointment_type] ?? TYPE_CONFIG.studio;

    const TypeIcon = type.icon;

    return (
      <button
        key={booking.id}
        type="button"
        className={`admin-calendar__event admin-calendar__event--${booking.status}`}
        onClick={() => onSelectBooking?.(booking.id)}
        title={`${booking.first_name} ${booking.last_name}`}
      >
        <span className="admin-calendar__event-time">
          {formatTime(booking.appointment_time)}
        </span>

        <span className="admin-calendar__event-name">
          {booking.first_name} {booking.last_name}
        </span>

        <TypeIcon size={13} />
      </button>
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="admin-calendar">
      <div className="admin-calendar__header">
        <div>
          <span className="admin-section-eyebrow">
            ORGANIZZAZIONE APPUNTAMENTI
          </span>

          <h2>Calendario</h2>

          <p>Consulta gli appuntamenti confermati e le richieste in attesa.</p>
        </div>

        <div className="admin-calendar__view-switch">
          <button
            type="button"
            className={view === "month" ? "is-active" : ""}
            onClick={() => setView("month")}
          >
            Mese
          </button>

          <button
            type="button"
            className={view === "week" ? "is-active" : ""}
            onClick={() => setView("week")}
          >
            Settimana
          </button>
        </div>
      </div>

      <div className="admin-calendar__toolbar">
        <h3>
          {view === "month"
            ? formatMonth(currentDate)
            : formatFullDate(startOfWeek(currentDate))}
        </h3>

        <div className="admin-calendar__navigation">
          <button type="button" onClick={goToday}>
            Oggi
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Periodo precedente"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Periodo successivo"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div className="admin-calendar__grid">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="admin-calendar__weekday">
            {day}
          </div>
        ))}

        {calendarDays.map((date) => {
          const key = toDateKey(date);

          const dayBookings = bookingsByDate.get(key) ?? [];

          const isToday = key === toDateKey(new Date());

          const isOutsideMonth =
            view === "month" && date.getMonth() !== currentDate.getMonth();

          return (
            <div
              key={key}
              className={[
                "admin-calendar__day",
                isToday ? "is-today" : "",
                isOutsideMonth ? "is-outside" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="admin-calendar__day-header">
                <span>{date.getDate()}</span>

                {dayBookings.length > 0 && <small>{dayBookings.length}</small>}
              </div>

              <div className="admin-calendar__events">
                {dayBookings.map(renderBooking)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-calendar__legend">
        <span>
          <i className="admin-calendar__dot admin-calendar__dot--confirmed" />
          Confermati
        </span>

        <span>
          <i className="admin-calendar__dot admin-calendar__dot--pending" />
          In attesa
        </span>
      </div>
    </section>
  );
};

export default AdminCalendar;
