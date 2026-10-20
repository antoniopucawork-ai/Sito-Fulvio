import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Video,
  Building2,
  XCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import "./AdminDashboard.css";

const STATUS_CONFIG = {
  pending: {
    label: "In attesa",
    icon: Clock3,
  },
  confirmed: {
    label: "Confermata",
    icon: CheckCircle2,
  },
  approved: {
    label: "Confermata",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rifiutata",
    icon: XCircle,
  },
  cancelled: {
    label: "Annullata",
    icon: XCircle,
  },
};

const TYPE_CONFIG = {
  video: {
    label: "Videochiamata",
    icon: Video,
  },
  studio: {
    label: "Presso lo studio",
    icon: MapPin,
  },
  azienda: {
    label: "Presso l'azienda",
    icon: Building2,
  },
};

const FILTERS = [
  { id: "all", label: "Tutte" },
  { id: "pending", label: "In attesa" },
  { id: "confirmed", label: "Confermate" },
  { id: "rejected", label: "Rifiutate" },
];

const formatDate = (date) => {
  if (!date) return "Data non disponibile";

  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const formatTime = (time) => {
  if (!time) return "--:--";
  return time.slice(0, 5);
};

const getStatusGroup = (status) => {
  if (status === "approved" || status === "confirmed") {
    return "confirmed";
  }

  if (status === "rejected" || status === "cancelled") {
    return "rejected";
  }

  return "pending";
};

const AdminDashboard = ({
  bookings = [],
  loading = false,
  error = "",
  onRefresh,
  onLogout,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard");

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => getStatusGroup(booking.status) === "pending",
      ).length,
      confirmed: bookings.filter(
        (booking) => getStatusGroup(booking.status) === "confirmed",
      ).length,
      rejected: bookings.filter(
        (booking) => getStatusGroup(booking.status) === "rejected",
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;

    return bookings.filter(
      (booking) => getStatusGroup(booking.status) === activeFilter,
    );
  }, [bookings, activeFilter]);

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__eyebrow">AREA RISERVATA</span>
          <h2>Studio Martello</h2>
          <p>Gestione appuntamenti</p>
        </div>

        <nav
          className="admin-sidebar__nav"
          aria-label="Navigazione amministrativa"
        >
          <button
            type="button"
            className={`admin-sidebar__link ${
              activeSection === "dashboard" ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveSection("dashboard");
              setActiveFilter("all");
            }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${
              activeSection === "bookings" ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveSection("bookings");
              setActiveFilter("all");
            }}
          >
            <CalendarDays size={19} />
            <span>Prenotazioni</span>
          </button>

          <div className="admin-sidebar__coming">
            <CalendarDays size={19} />
            <span>Calendario</span>
            <small>Prossimamente</small>
          </div>
        </nav>

        <div className="admin-sidebar__footer">
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__eyebrow">STUDIO MARTELLO</span>

            <h1>
              {activeSection === "dashboard" ? "Panoramica" : "Prenotazioni"}
            </h1>

            <p>
              {activeSection === "dashboard"
                ? "Tieni sotto controllo le richieste di appuntamento."
                : "Consulta e organizza le richieste ricevute."}
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={17} />
            <span>{loading ? "Aggiornamento..." : "Aggiorna"}</span>
          </button>
        </header>

        {/* STATISTICHE */}
        <section className="admin-stats" aria-label="Statistiche prenotazioni">
          <div className="admin-stat-card">
            <span>Richieste totali</span>
            <strong>{stats.total}</strong>
            <CalendarDays size={21} />
          </div>

          <div className="admin-stat-card admin-stat-card--pending">
            <span>In attesa</span>
            <strong>{stats.pending}</strong>
            <Clock3 size={21} />
          </div>

          <div className="admin-stat-card admin-stat-card--confirmed">
            <span>Confermate</span>
            <strong>{stats.confirmed}</strong>
            <CheckCircle2 size={21} />
          </div>

          <div className="admin-stat-card admin-stat-card--rejected">
            <span>Rifiutate</span>
            <strong>{stats.rejected}</strong>
            <XCircle size={21} />
          </div>
        </section>

        {/* PRENOTAZIONI */}
        <section className="admin-bookings">
          <div className="admin-bookings__heading">
            <div>
              <span className="admin-section-eyebrow">GESTIONE RICHIESTE</span>

              <h2>Appuntamenti</h2>

              <p>Visualizza le richieste inviate dai clienti.</p>
            </div>

            <span className="admin-bookings__count">
              {filteredBookings.length} richieste
            </span>
          </div>

          <div
            className="admin-filters"
            role="group"
            aria-label="Filtra prenotazioni"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`admin-filter ${
                  activeFilter === filter.id ? "is-active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="admin-feedback" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="admin-feedback" role="status">
              Caricamento delle prenotazioni...
            </div>
          )}

          {!loading && !error && filteredBookings.length === 0 && (
            <div className="admin-empty">
              <CalendarDays size={32} />
              <h3>Nessuna richiesta presente</h3>
              <p>Non ci sono appuntamenti per il filtro selezionato.</p>
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="admin-bookings__list">
              {filteredBookings.map((booking) => {
                const statusGroup = getStatusGroup(booking.status);

                const status =
                  STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

                const type =
                  TYPE_CONFIG[booking.appointment_type] ?? TYPE_CONFIG.studio;

                const StatusIcon = status.icon;
                const TypeIcon = type.icon;

                return (
                  <article className="admin-booking-card" key={booking.id}>
                    <div className="admin-booking-card__identity">
                      <div className="admin-booking-card__avatar">
                        {booking.first_name?.charAt(0)?.toUpperCase()}
                        {booking.last_name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <h3>
                          {booking.first_name} {booking.last_name}
                        </h3>

                        <span>Richiesta #{booking.id}</span>
                      </div>
                    </div>

                    <div
                      className={`admin-status admin-status--${statusGroup}`}
                    >
                      <StatusIcon size={15} />
                      {status.label}
                    </div>

                    <div className="admin-booking-card__details">
                      <div>
                        <CalendarDays size={18} />
                        <span>{formatDate(booking.appointment_date)}</span>
                      </div>

                      <div>
                        <Clock3 size={18} />
                        <span>{formatTime(booking.appointment_time)}</span>
                      </div>

                      <div>
                        <TypeIcon size={18} />
                        <span>{type.label}</span>
                      </div>
                    </div>

                    <div className="admin-booking-card__bottom">
                      <span>Richiesta ricevuta</span>

                      <span className="admin-booking-card__details-link">
                        Gestione dettagli
                        <ChevronRight size={17} />
                        <small>Prossimamente</small>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
