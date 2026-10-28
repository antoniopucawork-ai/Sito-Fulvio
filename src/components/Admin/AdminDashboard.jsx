import { useEffect, useMemo, useRef, useState } from "react";

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
  X,
  Mail,
  Phone,
  FileText,
  UserRound,
  AlertCircle,
} from "lucide-react";

import AdminCalendar from "./AdminCalendar.jsx";
import BookingProposalForm from "./BookingProposalForm.jsx";

import "./AdminDashboard.css";

// ==========================================
// CONFIGURAZIONE
// ==========================================

const STATUS_CONFIG = {
  pending: {
    label: "In attesa",
    icon: Clock3,
  },
  confirmed: {
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

// ==========================================
// FORMATTAZIONE
// ==========================================

const formatDate = (date) => {
  if (!date) return "Data non disponibile";

  const [year, month, day] = String(date).split("-").map(Number);

  if (!year || !month || !day) {
    return "Data non valida";
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "Data non valida";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const formatTime = (time) => {
  if (!time) return "--:--";

  return String(time).slice(0, 5);
};

const getStatusGroup = (status) => {
  if (status === "confirmed") return "confirmed";

  if (status === "rejected" || status === "cancelled") {
    return "rejected";
  }

  return "pending";
};

const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
};

const getTypeConfig = (type) => {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.studio;
};

// ==========================================
// CONTROLLO CONFLITTI
// ==========================================

const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const findBookingConflict = (booking, bookings) => {
  if (!booking) return null;

  const start = timeToMinutes(booking.appointment_time);

  const duration = Number(booking.duration_minutes);

  if (start === null || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  const end = start + duration;

  return (
    bookings.find((other) => {
      if (other.id === booking.id) return false;

      if (other.status !== "confirmed") {
        return false;
      }

      if (other.appointment_date !== booking.appointment_date) {
        return false;
      }

      const otherStart = timeToMinutes(other.appointment_time);

      const otherDuration = Number(other.duration_minutes);

      if (
        otherStart === null ||
        !Number.isFinite(otherDuration) ||
        otherDuration <= 0
      ) {
        return false;
      }

      const otherEnd = otherStart + otherDuration;

      return start < otherEnd && end > otherStart;
    }) ?? null
  );
};

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

const AdminDashboard = ({
  bookings = [],
  loading = false,
  error = "",
  onRefresh,
  onLogout,
  onUpdateBooking,
  onProposeBooking,
  updatingBookingId = null,
  actionError = "",
  actionSuccess = "",
}) => {
  // ========================================
  // STATI
  // ========================================

  const [activeFilter, setActiveFilter] = useState("all");

  const [activeSection, setActiveSection] = useState("dashboard");

  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [pendingAction, setPendingAction] = useState(null);

  const [showProposalForm, setShowProposalForm] = useState(false);

  // ========================================
  // RIFERIMENTI
  // ========================================

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const proposalFormRef = useRef(null);
  const modalContentRef = useRef(null);
  const actionInProgressRef = useRef(false);

  // ========================================
  // PRENOTAZIONE SELEZIONATA
  // ========================================

  const selectedBooking = useMemo(() => {
    if (selectedBookingId === null) {
      return null;
    }

    return bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  }, [bookings, selectedBookingId]);

  const isUpdating = updatingBookingId !== null;

  // ========================================
  // CONFLITTI
  // ========================================

  const conflictingBooking = useMemo(() => {
    return findBookingConflict(selectedBooking, bookings);
  }, [selectedBooking, bookings]);

  const hasConflict = Boolean(conflictingBooking);

  // ========================================
  // STATISTICHE
  // ========================================

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter((booking) => booking.status === "pending")
        .length,

      confirmed: bookings.filter((booking) => booking.status === "confirmed")
        .length,

      rejected: bookings.filter(
        (booking) =>
          booking.status === "rejected" || booking.status === "cancelled",
      ).length,
    };
  }, [bookings]);

  // ========================================
  // FILTRI
  // ========================================

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => getStatusGroup(booking.status) === activeFilter,
    );
  }, [bookings, activeFilter]);

  // ========================================
  // GESTIONE FINESTRA MODALE
  // ========================================

  useEffect(() => {
    if (!selectedBooking) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isUpdating || actionInProgressRef.current) {
          return;
        }

        if (showProposalForm) {
          setShowProposalForm(false);
          return;
        }

        if (pendingAction) {
          setPendingAction(null);
          return;
        }

        closeButtonRef.current?.click();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;

      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBooking, isUpdating, showProposalForm, pendingAction]);

  // ========================================
  // SCORRIMENTO AUTOMATICO PROPOSTA
  // ========================================

  useEffect(() => {
    if (!showProposalForm || !selectedBooking) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const container = modalContentRef.current;

      const target = proposalFormRef.current;

      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();

      const targetRect = target.getBoundingClientRect();

      const targetPosition =
        targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: targetPosition - 20,
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [showProposalForm, selectedBooking]);

  // ========================================
  // APERTURA DETTAGLI
  // ========================================

  const openBookingDetails = (bookingId) => {
    if (isUpdating || actionInProgressRef.current) {
      return;
    }

    previousFocusRef.current = document.activeElement;

    setSelectedBookingId(bookingId);
    setPendingAction(null);
    setShowProposalForm(false);

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
  };

  // ========================================
  // CHIUSURA DETTAGLI
  // ========================================

  const closeBookingDetails = () => {
    if (isUpdating || actionInProgressRef.current) {
      return;
    }

    setSelectedBookingId(null);
    setPendingAction(null);
    setShowProposalForm(false);

    window.requestAnimationFrame(() => {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    });
  };

  // ========================================
  // APPROVAZIONE / RIFIUTO
  // ========================================

  const requestBookingAction = (status) => {
    if (!selectedBooking) return;

    if (selectedBooking.status !== "pending") {
      return;
    }

    if (isUpdating || actionInProgressRef.current) {
      return;
    }

    if (showProposalForm) return;

    if (!["confirmed", "rejected"].includes(status)) {
      return;
    }

    if (status === "confirmed") {
      if (hasConflict) return;

      if (
        selectedBooking.proposal_status === "sent" ||
        selectedBooking.proposal_status === "accepted"
      ) {
        return;
      }
    }

    setPendingAction(status);
  };

  // ========================================
  // CONFERMA APPROVAZIONE / RIFIUTO
  // ========================================

  const confirmBookingAction = async () => {
    if (
      !selectedBooking ||
      !pendingAction ||
      typeof onUpdateBooking !== "function" ||
      isUpdating ||
      actionInProgressRef.current
    ) {
      return;
    }

    if (selectedBooking.status !== "pending") {
      return;
    }

    if (
      pendingAction === "confirmed" &&
      (hasConflict ||
        selectedBooking.proposal_status === "sent" ||
        selectedBooking.proposal_status === "accepted")
    ) {
      setPendingAction(null);
      return;
    }

    actionInProgressRef.current = true;

    try {
      const success = await onUpdateBooking(selectedBooking.id, pendingAction);

      if (success) {
        setSelectedBookingId(null);
        setPendingAction(null);
        setShowProposalForm(false);

        window.requestAnimationFrame(() => {
          if (previousFocusRef.current?.isConnected) {
            previousFocusRef.current.focus();
          }
        });
      }
    } finally {
      actionInProgressRef.current = false;
    }
  };

  // ========================================
  // APERTURA MODULO PROPOSTA
  // ========================================

  const openProposalForm = () => {
    if (!selectedBooking) return;

    if (selectedBooking.status !== "pending") {
      return;
    }

    if (isUpdating || actionInProgressRef.current) {
      return;
    }

    if (
      selectedBooking.proposal_status === "sent" ||
      selectedBooking.proposal_status === "accepted"
    ) {
      return;
    }

    setPendingAction(null);
    setShowProposalForm(true);
  };

  // ========================================
  // CHIUSURA MODULO PROPOSTA
  // ========================================

  const closeProposalForm = () => {
    if (isUpdating || actionInProgressRef.current) {
      return;
    }

    setShowProposalForm(false);
  };

  // ========================================
  // SALVATAGGIO PROPOSTA
  // ========================================

  const handleSaveProposal = async (bookingId, date, time, note) => {
    if (
      typeof onProposeBooking !== "function" ||
      isUpdating ||
      actionInProgressRef.current
    ) {
      return false;
    }

    actionInProgressRef.current = true;

    try {
      const success = await onProposeBooking(bookingId, date, time, note);

      if (success) {
        setShowProposalForm(false);
      }

      return success;
    } finally {
      actionInProgressRef.current = false;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="admin-dashboard">
      {/* ======================================
          SIDEBAR
      ====================================== */}

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
          {/* DASHBOARD */}

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

          {/* PRENOTAZIONI */}

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

          {/* CALENDARIO */}

          <button
            type="button"
            className={`admin-sidebar__link ${
              activeSection === "calendar" ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveSection("calendar");
            }}
          >
            <CalendarDays size={19} />
            <span>Calendario</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={onLogout}
            disabled={isUpdating}
          >
            <LogOut size={18} />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* ======================================
          CONTENUTO PRINCIPALE
      ====================================== */}

      <main className="admin-main">
        {/* HEADER */}

        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__eyebrow">STUDIO MARTELLO</span>

            <h1>
              {activeSection === "dashboard"
                ? "Panoramica"
                : activeSection === "bookings"
                  ? "Prenotazioni"
                  : "Calendario"}
            </h1>

            <p>
              {activeSection === "dashboard"
                ? "Tieni sotto controllo le richieste di appuntamento."
                : activeSection === "bookings"
                  ? "Consulta e organizza le richieste ricevute."
                  : "Visualizza e organizza gli appuntamenti dello studio."}
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={onRefresh}
            disabled={loading || isUpdating}
          >
            <RefreshCw size={17} />

            <span>{loading ? "Aggiornamento..." : "Aggiorna"}</span>
          </button>
        </header>

        {/* ======================================
            MESSAGGI
        ====================================== */}

        {actionError && (
          <div className="admin-feedback" role="alert">
            <AlertCircle size={19} />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="admin-feedback" role="status">
            <CheckCircle2 size={19} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* ======================================
            CALENDARIO
        ====================================== */}

        {activeSection === "calendar" ? (
          <AdminCalendar
            bookings={bookings}
            onSelectBooking={openBookingDetails}
          />
        ) : (
          <>
            {/* ==================================
                STATISTICHE
            ================================== */}

            <section
              className="admin-stats"
              aria-label="Statistiche prenotazioni"
            >
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

            {/* ==================================
                PRENOTAZIONI
            ================================== */}

            <section className="admin-bookings">
              <div className="admin-bookings__heading">
                <div>
                  <span className="admin-section-eyebrow">
                    GESTIONE RICHIESTE
                  </span>

                  <h2>Appuntamenti</h2>

                  <p>Visualizza e gestisci le richieste inviate dai clienti.</p>
                </div>

                <span className="admin-bookings__count">
                  {filteredBookings.length} richieste
                </span>
              </div>

              {/* FILTRI */}

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
                    onClick={() => {
                      setActiveFilter(filter.id);
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* ERRORI */}

              {error && (
                <div className="admin-feedback" role="alert">
                  {error}
                </div>
              )}

              {/* CARICAMENTO */}

              {loading && (
                <div className="admin-feedback" role="status">
                  Caricamento delle prenotazioni...
                </div>
              )}

              {/* LISTA VUOTA */}

              {!loading && !error && filteredBookings.length === 0 && (
                <div className="admin-empty">
                  <CalendarDays size={32} />

                  <h3>Nessuna richiesta presente</h3>

                  <p>Non ci sono appuntamenti per il filtro selezionato.</p>
                </div>
              )}

              {/* ELENCO PRENOTAZIONI */}

              {!loading && !error && filteredBookings.length > 0 && (
                <div className="admin-bookings__list">
                  {filteredBookings.map((booking) => {
                    const statusGroup = getStatusGroup(booking.status);

                    const status = getStatusConfig(booking.status);

                    const type = getTypeConfig(booking.appointment_type);

                    const StatusIcon = status.icon;

                    const TypeIcon = type.icon;

                    return (
                      <article className="admin-booking-card" key={booking.id}>
                        {/* CLIENTE */}

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

                        {/* STATO */}

                        <div
                          className={`admin-status admin-status--${statusGroup}`}
                        >
                          <StatusIcon size={15} />
                          {status.label}
                        </div>

                        {/* DETTAGLI */}

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

                        {/* AZIONI */}

                        <div className="admin-booking-card__bottom">
                          <span>
                            {booking.status === "pending"
                              ? "In attesa di approvazione"
                              : status.label}
                          </span>

                          <button
                            type="button"
                            className="admin-booking-card__details-link"
                            onClick={() => {
                              openBookingDetails(booking.id);
                            }}
                          >
                            Gestione dettagli
                            <ChevronRight size={17} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ======================================
          FINESTRA DETTAGLI
      ====================================== */}

      {selectedBooking && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBookingDetails();
            }
          }}
        >
          <section
            ref={dialogRef}
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            tabIndex={-1}
          >
            {/* HEADER */}

            <div className="admin-modal__header">
              <div>
                <span className="admin-section-eyebrow">
                  DETTAGLI RICHIESTA
                </span>

                <h2 id="admin-modal-title">
                  Prenotazione #{selectedBooking.id}
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="admin-modal__close"
                onClick={closeBookingDetails}
                disabled={isUpdating}
                aria-label="Chiudi dettagli"
              >
                <X size={21} />
              </button>
            </div>

            {/* CONTENUTO */}

            <div ref={modalContentRef} className="admin-modal__content">
              {/* CLIENTE */}

              <div className="admin-modal__section">
                <h3>
                  <UserRound size={19} />
                  Informazioni cliente
                </h3>

                <div className="admin-modal__info">
                  <span>Nome e cognome</span>

                  <strong>
                    {selectedBooking.first_name} {selectedBooking.last_name}
                  </strong>
                </div>

                <div className="admin-modal__info">
                  <span>
                    <Mail size={16} />
                    Email
                  </span>

                  {selectedBooking.email ? (
                    <a href={`mailto:${selectedBooking.email}`}>
                      {selectedBooking.email}
                    </a>
                  ) : (
                    <strong>Non disponibile</strong>
                  )}
                </div>

                <div className="admin-modal__info">
                  <span>
                    <Phone size={16} />
                    Telefono
                  </span>

                  {selectedBooking.phone ? (
                    <a href={`tel:${selectedBooking.phone}`}>
                      {selectedBooking.phone}
                    </a>
                  ) : (
                    <strong>Non disponibile</strong>
                  )}
                </div>
              </div>

              {/* APPUNTAMENTO */}

              <div className="admin-modal__section">
                <h3>
                  <CalendarDays size={19} />
                  Informazioni appuntamento
                </h3>

                <div className="admin-modal__info">
                  <span>Data richiesta</span>

                  <strong>
                    {formatDate(selectedBooking.appointment_date)}
                  </strong>
                </div>

                <div className="admin-modal__info">
                  <span>Ora richiesta</span>

                  <strong>
                    {formatTime(selectedBooking.appointment_time)}
                  </strong>
                </div>

                <div className="admin-modal__info">
                  <span>Durata</span>

                  <strong>
                    {selectedBooking.duration_minutes
                      ? `${selectedBooking.duration_minutes} minuti`
                      : "Non disponibile"}
                  </strong>
                </div>

                <div className="admin-modal__info">
                  <span>Modalità</span>

                  <strong>
                    {getTypeConfig(selectedBooking.appointment_type).label}
                  </strong>
                </div>

                <div className="admin-modal__info">
                  <span>Stato</span>

                  <strong>
                    {getStatusConfig(selectedBooking.status).label}
                  </strong>
                </div>
              </div>

              {/* AZIENDA */}

              {selectedBooking.appointment_type === "azienda" && (
                <div className="admin-modal__section">
                  <h3>
                    <Building2 size={19} />
                    Informazioni azienda
                  </h3>

                  <div className="admin-modal__info">
                    <span>Nome azienda</span>

                    <strong>
                      {selectedBooking.company_name || "Non disponibile"}
                    </strong>
                  </div>

                  <div className="admin-modal__info">
                    <span>Indirizzo</span>

                    <strong>
                      {selectedBooking.company_address || "Non disponibile"}
                    </strong>
                  </div>
                </div>
              )}

              {/* NOTE */}

              <div className="admin-modal__section">
                <h3>
                  <FileText size={19} />
                  Note del cliente
                </h3>

                <p className="admin-modal__notes">
                  {selectedBooking.notes || "Nessuna nota inserita."}
                </p>
              </div>

              {/* CONFLITTO */}

              {selectedBooking.status === "pending" && hasConflict && (
                <div className="admin-modal__confirmation" role="alert">
                  <AlertCircle size={21} />

                  <div>
                    <strong>Orario già occupato</strong>

                    <p>
                      Il {formatDate(selectedBooking.appointment_date)} alle{" "}
                      {formatTime(selectedBooking.appointment_time)} è già
                      presente un appuntamento confermato con{" "}
                      <strong>
                        {conflictingBooking.first_name}{" "}
                        {conflictingBooking.last_name}
                      </strong>
                      .
                    </p>

                    <p>
                      Puoi rifiutare questa richiesta oppure proporre un nuovo
                      orario.
                    </p>
                  </div>
                </div>
              )}

              {/* BOZZA PROPOSTA */}

              {selectedBooking.proposal_status === "draft" &&
                !showProposalForm && (
                  <div className="admin-modal__confirmation" role="status">
                    <CalendarDays size={21} />

                    <div>
                      <strong>Bozza proposta salvata</strong>

                      <p>
                        Nuovo appuntamento:{" "}
                        {formatDate(selectedBooking.proposed_date)} alle{" "}
                        {formatTime(selectedBooking.proposed_time)}.
                      </p>

                      {selectedBooking.proposal_note && (
                        <p>Nota: {selectedBooking.proposal_note}</p>
                      )}

                      <p>La proposta non è ancora stata inviata al cliente.</p>
                    </div>
                  </div>
                )}

              {/* PROPOSTA INVIATA */}

              {selectedBooking.proposal_status === "sent" && (
                <div className="admin-modal__confirmation" role="status">
                  <Mail size={21} />

                  <div>
                    <strong>Proposta inviata al cliente</strong>

                    <p>
                      {formatDate(selectedBooking.proposed_date)} alle{" "}
                      {formatTime(selectedBooking.proposed_time)}.
                    </p>

                    <p>In attesa della risposta del cliente.</p>
                  </div>
                </div>
              )}

              {/* PROPOSTA ACCETTATA */}

              {selectedBooking.proposal_status === "accepted" && (
                <div className="admin-modal__confirmation" role="status">
                  <CheckCircle2 size={21} />

                  <div>
                    <strong>Proposta accettata dal cliente</strong>

                    <p>
                      Data proposta: {formatDate(selectedBooking.proposed_date)}{" "}
                      alle {formatTime(selectedBooking.proposed_time)}.
                    </p>

                    <p>
                      L'appuntamento originale non è stato modificato
                      automaticamente.
                    </p>
                  </div>
                </div>
              )}

              {/* MODULO PROPOSTA */}

              {selectedBooking.status === "pending" && showProposalForm && (
                <div ref={proposalFormRef} className="admin-proposal-container">
                  <BookingProposalForm
                    key={selectedBooking.id}
                    booking={selectedBooking}
                    onSave={handleSaveProposal}
                    onCancel={closeProposalForm}
                    saving={isUpdating}
                  />
                </div>
              )}

              {/* CONFERMA OPERAZIONE */}

              {pendingAction && (
                <div className="admin-modal__confirmation" role="alert">
                  <AlertCircle size={21} />

                  <div>
                    <strong>
                      {pendingAction === "confirmed"
                        ? "Confermare questo appuntamento?"
                        : "Rifiutare questa richiesta?"}
                    </strong>

                    <p>
                      {pendingAction === "confirmed"
                        ? "La prenotazione verrà contrassegnata come confermata."
                        : "La richiesta verrà contrassegnata come rifiutata."}
                    </p>
                  </div>
                </div>
              )}

              {/* ERRORI OPERAZIONE */}

              {actionError && (
                <div className="admin-feedback" role="alert">
                  {actionError}
                </div>
              )}
            </div>

            {/* ==================================
                PULSANTI MODALE
            ================================== */}

            <div className="admin-modal__footer">
              {selectedBooking.status === "pending" ? (
                showProposalForm ? (
                  <button
                    type="button"
                    className="admin-modal__button admin-modal__button--secondary"
                    onClick={closeProposalForm}
                    disabled={isUpdating}
                  >
                    Chiudi proposta
                  </button>
                ) : pendingAction ? (
                  <>
                    <button
                      type="button"
                      className="admin-modal__button admin-modal__button--secondary"
                      onClick={() => {
                        setPendingAction(null);
                      }}
                      disabled={isUpdating}
                    >
                      Indietro
                    </button>

                    <button
                      type="button"
                      className={`admin-modal__button ${
                        pendingAction === "confirmed"
                          ? "admin-modal__button--approve"
                          : "admin-modal__button--reject"
                      }`}
                      onClick={confirmBookingAction}
                      disabled={
                        isUpdating ||
                        (pendingAction === "confirmed" &&
                          (hasConflict ||
                            selectedBooking.proposal_status === "sent" ||
                            selectedBooking.proposal_status === "accepted"))
                      }
                    >
                      {isUpdating
                        ? "Salvataggio..."
                        : pendingAction === "confirmed"
                          ? "Conferma approvazione"
                          : "Conferma rifiuto"}
                    </button>
                  </>
                ) : (
                  <>
                    {/* PROPOSTA */}

                    {selectedBooking.proposal_status !== "sent" &&
                      selectedBooking.proposal_status !== "accepted" && (
                        <button
                          type="button"
                          className="admin-modal__button admin-modal__button--secondary"
                          onClick={openProposalForm}
                          disabled={isUpdating}
                        >
                          <CalendarDays size={18} />

                          {selectedBooking.proposal_status === "draft"
                            ? "Modifica proposta"
                            : "Proponi nuovo orario"}
                        </button>
                      )}

                    {/* RIFIUTO */}

                    <button
                      type="button"
                      className="admin-modal__button admin-modal__button--reject"
                      onClick={() => {
                        requestBookingAction("rejected");
                      }}
                      disabled={isUpdating}
                    >
                      <XCircle size={18} />
                      Rifiuta
                    </button>

                    {/* APPROVAZIONE */}

                    <button
                      type="button"
                      className="admin-modal__button admin-modal__button--approve"
                      onClick={() => {
                        requestBookingAction("confirmed");
                      }}
                      disabled={
                        isUpdating ||
                        hasConflict ||
                        selectedBooking.proposal_status === "sent" ||
                        selectedBooking.proposal_status === "accepted"
                      }
                    >
                      <CheckCircle2 size={18} />
                      Approva
                    </button>
                  </>
                )
              ) : (
                <button
                  type="button"
                  className="admin-modal__button admin-modal__button--secondary"
                  onClick={closeBookingDetails}
                  disabled={isUpdating}
                >
                  Chiudi
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
