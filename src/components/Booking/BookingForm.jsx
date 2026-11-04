import { useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  MapPin,
  MessageSquare,
  Send,
} from "lucide-react";

import "./BookingForm.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  companyAddress: "",
  notes: "",
  privacyAccepted: false,
};

const BookingForm = ({
  appointmentType,
  selectedDate,
  selectedTime,
  onSubmit,
  submissionEnabled = false,
}) => {
  // DATI DEL MODULO
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // CLOUDFLARE TURNSTILE
  const turnstileRef = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const requiresCompanyAddress = appointmentType?.id === "azienda";

  const canSubmit =
    submissionEnabled &&
    Boolean(siteKey) &&
    Boolean(turnstileToken) &&
    !isSubmitting &&
    !submitSuccess;

  // GESTIONE CAMPI
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  // RESET VERIFICA ANTISPAM
  const resetTurnstile = () => {
    setTurnstileToken("");
    turnstileRef.current?.reset();
  };

  // INVIO RICHIESTA
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!submissionEnabled || isSubmitting || submitSuccess) {
      return;
    }

    if (
      !appointmentType ||
      !selectedDate ||
      !selectedTime ||
      !formData.privacyAccepted
    ) {
      setSubmitError("Controlla i dati obbligatori.");
      return;
    }

    if (!siteKey || !turnstileToken) {
      setSubmitError("Completa la verifica di sicurezza prima di procedere.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setSubmitError("Il servizio di prenotazione non è disponibile.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const bookingData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),

        companyName: requiresCompanyAddress ? formData.companyName.trim() : "",

        companyAddress: requiresCompanyAddress
          ? formData.companyAddress.trim()
          : "",

        notes: formData.notes.trim(),

        appointmentType: appointmentType.id,

        date: [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, "0"),
          String(selectedDate.getDate()).padStart(2, "0"),
        ].join("-"),

        time: selectedTime,
        duration: appointmentType.duration,
        privacyAccepted: formData.privacyAccepted,

        // Token da verificare successivamente sul server
        turnstileToken,
      };

      const result = await onSubmit(bookingData);

      if (result?.success === true) {
        setSubmitSuccess(
          "La tua richiesta è stata ricevuta correttamente! " +
            "L'appuntamento non è ancora confermato. " +
            "Dovrai attendere l'approvazione del Dott. Fulvio Martello.",
        );

        setTurnstileToken("");
      } else {
        throw new Error("Il server non ha confermato la ricezione.");
      }
    } catch (error) {
      console.error("Errore durante la richiesta:", error);

      setSubmitError(
        "Non è stato possibile inviare la richiesta. Riprova più tardi.",
      );

      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="booking-form">
      {/* INTESTAZIONE */}
      <div className="booking-form__heading">
        <span className="booking-page__step">PASSAGGIO 03</span>

        <h2>Completa la tua richiesta</h2>

        <p>
          Inserisci i tuoi dati per richiedere un appuntamento con il Dott.
          Fulvio Martello.
        </p>
      </div>

      <form className="booking-form__card" onSubmit={handleSubmit}>
        <div className="booking-form__grid">
          {/* NOME */}
          <div className="booking-form__field">
            <label htmlFor="booking-firstName">
              <UserRound size={17} />
              Nome *
            </label>

            <input
              id="booking-firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Mario"
              maxLength={80}
              required
              disabled={Boolean(submitSuccess)}
            />
          </div>

          {/* COGNOME */}
          <div className="booking-form__field">
            <label htmlFor="booking-lastName">
              <UserRound size={17} />
              Cognome *
            </label>

            <input
              id="booking-lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Rossi"
              maxLength={80}
              required
              disabled={Boolean(submitSuccess)}
            />
          </div>

          {/* EMAIL */}
          <div className="booking-form__field">
            <label htmlFor="booking-email">
              <Mail size={17} />
              Email *
            </label>

            <input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mario@email.it"
              maxLength={254}
              required
              disabled={Boolean(submitSuccess)}
            />
          </div>

          {/* TELEFONO */}
          <div className="booking-form__field">
            <label htmlFor="booking-phone">
              <Phone size={17} />
              Telefono *
            </label>

            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+39 333 1234567"
              maxLength={30}
              required
              disabled={Boolean(submitSuccess)}
            />
          </div>

          {/* CAMPI AZIENDA */}
          {requiresCompanyAddress && (
            <>
              <div className="booking-form__field">
                <label htmlFor="booking-companyName">
                  <Building2 size={17} />
                  Nome azienda *
                </label>

                <input
                  id="booking-companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Nome della tua azienda"
                  maxLength={120}
                  required
                  disabled={Boolean(submitSuccess)}
                />
              </div>

              <div className="booking-form__field">
                <label htmlFor="booking-companyAddress">
                  <MapPin size={17} />
                  Indirizzo azienda *
                </label>

                <input
                  id="booking-companyAddress"
                  name="companyAddress"
                  type="text"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  placeholder="Via, numero civico, città"
                  maxLength={250}
                  required
                  disabled={Boolean(submitSuccess)}
                />
              </div>
            </>
          )}

          {/* NOTE */}
          <div className="booking-form__field booking-form__field--full">
            <label htmlFor="booking-notes">
              <MessageSquare size={17} />
              Motivo della consulenza (facoltativo)
            </label>

            <textarea
              id="booking-notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Descrivi brevemente il motivo dell'appuntamento, senza inserire informazioni riservate."
              maxLength={500}
              disabled={Boolean(submitSuccess)}
            />

            <span className="booking-form__hint">
              Massimo 500 caratteri. Non inserire dati sensibili.
            </span>
          </div>
        </div>

        {/* PRIVACY */}
        <label className="booking-form__privacy">
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={formData.privacyAccepted}
            onChange={handleChange}
            required
            disabled={Boolean(submitSuccess)}
          />

          <span>
            Dichiaro di aver letto l'
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              informativa sulla privacy
            </a>
            .
          </span>
        </label>

        {/* AVVISO */}
        <div className="booking-form__notice">
          L'invio della richiesta non garantisce la prenotazione
          dell'appuntamento. Riceverai una conferma soltanto dopo l'approvazione
          del Dott. Fulvio Martello.
        </div>

        {/* MESSAGGIO SUCCESSO */}
        {submitSuccess && (
          <p className="booking-form__notice" role="status">
            {submitSuccess}
          </p>
        )}

        {/* MESSAGGIO ERRORE */}
        {submitError && (
          <p className="booking-form__notice" role="alert">
            {submitError}
          </p>
        )}

        {/* CLOUDFLARE TURNSTILE */}
        {siteKey && !submitSuccess && (
          <div className="booking-form__turnstile">
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setSubmitError("");
              }}
              onExpire={() => {
                setTurnstileToken("");
              }}
              onError={() => {
                setTurnstileToken("");
                setSubmitError("Verifica di sicurezza non riuscita. Riprova.");
              }}
            />
          </div>
        )}

        {/* PULSANTE INVIO */}
        <button
          type="submit"
          className="booking-form__submit"
          disabled={!canSubmit}
        >
          <Send size={19} />

          {isSubmitting
            ? "Invio in corso..."
            : submitSuccess
              ? "Richiesta inviata"
              : submissionEnabled
                ? "Invia richiesta di appuntamento"
                : "Invio disponibile a breve"}
        </button>

        {/* SISTEMA NON ANCORA ATTIVO */}
        {!submissionEnabled && (
          <p
            className="booking-form__hint"
            role="status"
            style={{
              display: "block",
              marginTop: "15px",
              textAlign: "center",
            }}
          >
            Il sistema di prenotazione è in fase di attivazione. Puoi compilare
            il modulo per provarlo, ma non è ancora possibile inviare richieste.
          </p>
        )}
      </form>
    </section>
  );
};

export default BookingForm;
