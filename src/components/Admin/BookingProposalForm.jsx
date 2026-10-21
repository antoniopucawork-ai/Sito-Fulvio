import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Send, AlertCircle } from "lucide-react";

const BookingProposalForm = ({ booking, onSave, onCancel, saving }) => {
  const [date, setDate] = useState(booking.proposed_date || "");
  const [time, setTime] = useState(booking.proposed_time?.slice(0, 5) || "");
  const [note, setNote] = useState(booking.proposal_note || "");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();

    const loadSlots = async () => {
      setLoadingSlots(true);
      setError("");
      setAvailableSlots([]);

      try {
        const params = new URLSearchParams({
          date,
          type: booking.appointment_type,
        });

        const response = await fetch(
          `/.netlify/functions/get-availability?${params}`,
          { signal: controller.signal },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Impossibile verificare gli orari.",
          );
        }

        if (!controller.signal.aborted) {
          setAvailableSlots(result.availableSlots || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Errore nel caricamento.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSlots(false);
        }
      }
    };

    void loadSlots();

    return () => controller.abort();
  }, [date, booking.appointment_type]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date || !time) {
      setError("Seleziona una data e un orario.");
      return;
    }

    if (!availableSlots.includes(time)) {
      setError("L'orario selezionato non è disponibile.");
      return;
    }

    setError("");

    await onSave(booking.id, date, time, note);
  };

  return (
    <form className="admin-proposal" onSubmit={handleSubmit}>
      <h3>Proponi un nuovo appuntamento</h3>

      <p>
        Seleziona una nuova disponibilità da proporre al cliente. La richiesta
        originale rimarrà invariata.
      </p>

      <label htmlFor="proposal-date">
        <CalendarDays size={17} />
        Nuova data
      </label>

      <input
        id="proposal-date"
        type="date"
        value={date}
        onChange={(event) => {
          setDate(event.target.value);
          setTime("");
        }}
        required
        disabled={saving}
      />

      <label htmlFor="proposal-time">
        <Clock3 size={17} />
        Nuovo orario
      </label>

      <select
        id="proposal-time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        disabled={!date || loadingSlots || saving}
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

      <label htmlFor="proposal-note">
        Messaggio per il cliente (facoltativo)
      </label>

      <textarea
        id="proposal-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ad esempio: Le propongo questa alternativa per la consulenza."
        rows={3}
        maxLength={1000}
        disabled={saving}
      />

      {error && (
        <div className="admin-feedback" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="admin-proposal__actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Annulla
        </button>

        <button
          type="submit"
          disabled={saving || loadingSlots || !availableSlots.includes(time)}
        >
          <Send size={17} />
          {saving ? "Salvataggio..." : "Salva bozza"}
        </button>
      </div>
    </form>
  );
};

export default BookingProposalForm;
