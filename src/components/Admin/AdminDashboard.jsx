import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AdminCalendar from "./AdminCalendar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";
import AdminStats from "./AdminStats.jsx";
import AdminBookingList from "./AdminBookingList.jsx";
import BookingDetailsModal from "./BookingDetailsModal.jsx";
import { findBookingConflict, getStatusGroup } from "./adminBookingUtils.js";
import "./AdminDashboard.css";

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

  const hasActiveProposal = Boolean(
    selectedBooking?.proposed_date ||
    selectedBooking?.proposed_time ||
    selectedBooking?.proposal_status,
  );

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

    if (status === "confirmed" && (hasConflict || hasActiveProposal)) {
      return;
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
      (hasConflict || hasActiveProposal)
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

      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} setActiveFilter={setActiveFilter} onLogout={onLogout} isUpdating={isUpdating} />

      {/* ======================================
          CONTENUTO PRINCIPALE
      ====================================== */}

      <main className="admin-main">
        {/* HEADER */}

        <AdminTopbar activeSection={activeSection} onRefresh={onRefresh} loading={loading} isUpdating={isUpdating} />

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

            <AdminStats stats={stats} />

            {/* ==================================
                PRENOTAZIONI
            ================================== */}

            <AdminBookingList filteredBookings={filteredBookings} activeFilter={activeFilter} setActiveFilter={setActiveFilter} error={error} loading={loading} openBookingDetails={openBookingDetails} />
          </>
        )}
      </main>

      {/* ======================================
          FINESTRA DETTAGLI
      ====================================== */}

      {selectedBooking && (
        <BookingDetailsModal
          selectedBooking={selectedBooking}
          dialogRef={dialogRef}
          closeButtonRef={closeButtonRef}
          modalContentRef={modalContentRef}
          proposalFormRef={proposalFormRef}
          closeBookingDetails={closeBookingDetails}
          isUpdating={isUpdating}
          hasConflict={hasConflict}
          hasActiveProposal={hasActiveProposal}
          conflictingBooking={conflictingBooking}
          showProposalForm={showProposalForm}
          closeProposalForm={closeProposalForm}
          pendingAction={pendingAction}
          setPendingAction={setPendingAction}
          confirmBookingAction={confirmBookingAction}
          openProposalForm={openProposalForm}
          handleSaveProposal={handleSaveProposal}
          requestBookingAction={requestBookingAction}
          actionError={actionError}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
