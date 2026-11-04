import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Send, AlertCircle } from "lucide-react";

// ==========================================
// VALIDAZIONE DATE
// ==========================================

const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

const isWeekend = (date) => {
  if (!isValidDate(date)) return false;

  const day = new Date(`${date}T12:00:00Z`).getUTCDay();

  return day === 0 || day === 6;
};

const WEEKEND_ERROR =
  "Lo studio è chiuso il sabato e la domenica. Seleziona un giorno dal lunedì al venerdì.";

// ==========================================
// COMPONENTE
// ==========================================

const BookingProposalForm = ({ booking, onSave, onCancel, saving }) => {
  const [date, setDate] = useState(booking.proposed_date || "");

  const [time, setTime] = useState(booking.proposed_time?.slice(0, 5) || "");

  const [note, setNote] = useState(booking.proposal_note || "");

  const [error, setError] = useState("");

  // Conserva anche la data a cui appartengono
  // gli orari ricevuti dal server.
  const [availability, setAvailability] = useState({
    key: null,
    slots: [],
    error: "",
  });

  // ==========================================
  // DISPONIBILITÀ CORRENTE
  // ==========================================

  const validSelectedDate = isValidDate(date) && !isWeekend(date);

  const requestKey = validSelectedDate
    ? `${date}|${booking.appointment_type}`
    : null;

  const availabilityReady =
    requestKey !== null && availability.key === requestKey;

  const loadingSlots = requestKey !== null && !availabilityReady;

  const availableSlots = availabilityReady ? availability.slots : [];

  const availabilityError = availabilityReady ? availability.error : "";

  // ==========================================
  // CAMBIO DATA
  // ==========================================

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    setTime("");
    setError("");

    // Elimina gli orari precedenti.
    setAvailability({
      key: null,
      slots: [],
      error: "",
    });

    if (!selectedDate) {
      setDate("");
      return;
    }

    if (!isValidDate(selectedDate)) {
      setDate("");
      setError("Seleziona una data valida.");
      return;
    }

    if (isWeekend(selectedDate)) {
      setDate("");
      setError(WEEKEND_ERROR);
      return;
    }

    setDate(selectedDate);
  };

  // ==========================================
  // RECUPERO ORARI DISPONIBILI
  // ==========================================

  useEffect(() => {
    if (!isValidDate(date) || isWeekend(date)) {
      return;
    }

    const controller = new AbortController();
    const key = `${date}|${booking.appointment_type}`;

    const loadSlots = async () => {
      try {
        const params = new URLSearchParams({
          date,
          type: booking.appointment_type,
        });

        const response = await fetch(
          `/.netlify/functions/get-availability?${params}`,
          {
            signal: controller.signal,
          },
        );

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message || "Impossibile verificare gli orari.",
          );
        }

        if (controller.signal.aborted) return;

        const slots = Array.isArray(result.availableSlots)
          ? result.availableSlots
          : [];

        setAvailability({
          key,
          slots,
          error:
            slots.length === 0
              ? "Nessun orario disponibile per questa data."
              : "",
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        setAvailability({
          key,
          slots: [],
          error:
            err instanceof Error
              ? err.message
              : "Errore nel caricamento degli orari.",
        });
      }
    };

    void loadSlots();

    return () => {
      controller.abort();
    };
  }, [date, booking.appointment_type]);

  // ==========================================
  // SALVATAGGIO BOZZA
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || loadingSlots) return;

    if (!date || !time) {
      setError("Seleziona una data e un orario.");
      return;
    }

    if (!isValidDate(date)) {
      setError("La data selezionata non è valida.");
      return;
    }

    if (isWeekend(date)) {
      setError(WEEKEND_ERROR);
      return;
    }

    if (!availableSlots.includes(time)) {
      setError("L'orario selezionato non è più disponibile.");
      return;
    }

    setError("");

    try {
      await onSave(booking.id, date, time, note);
    } catch {
      setError("Impossibile salvare la proposta. Riprova.");
    }
  };

  // ==========================================
  // INTERFACCIA
  // ==========================================

  return (
    <form className="admin-proposal" onSubmit={handleSubmit}>
      <h3>Proponi un nuovo appuntamento</h3>

      <p>
        Seleziona una nuova disponibilità da proporre al cliente. La richiesta
        originale rimarrà invariata.
      </p>

      {/* DATA */}

      <label htmlFor="proposal-date">
        <CalendarDays size={17} />
        Nuova data
      </label>

      <input
        id="proposal-date"
        type="date"
        value={date}
        onChange={handleDateChange}
        required
        disabled={saving}
      />

      {/* ORARIO */}

      <label htmlFor="proposal-time">
        <Clock3 size={17} />
        Nuovo orario
      </label>

      <select
        id="proposal-time"
        value={time}
        onChange={(event) => {
          setTime(event.target.value);
          setError("");
        }}
        disabled={!validSelectedDate || loadingSlots || saving}
        required
      >
        <option value="">
          {loadingSlots ? "Caricamento orari..." : "Seleziona un orario"}
        </option>

        {availableSlots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>

      {/* NOTA */}

      <label htmlFor="proposal-note">
        Messaggio per il cliente (facoltativo)
      </label>

      <textarea
        id="proposal-note"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
        }}
        placeholder="Ad esempio: Le propongo questa alternativa per la consulenza."
        rows={3}
        maxLength={1000}
        disabled={saving}
      />

      {/* ERRORI */}

      {(error || availabilityError) && (
        <div className="admin-feedback" role="alert">
          <AlertCircle size={18} />
          <span>{error || availabilityError}</span>
        </div>
      )}

      {/* AZIONI */}

      <div className="admin-proposal__actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Annulla
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            loadingSlots ||
            !validSelectedDate ||
            !availableSlots.includes(time)
          }
        >
          <Send size={17} />
          {saving ? "Salvataggio..." : "Salva bozza"}
        </button>
      </div>
    </form>
  );
};

export default BookingProposalForm;
