import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import "./BookingAdminPage.css";

const BookingAdminPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Email o password non corretti.");
        return;
      }

      setLoggedIn(true);
      setPassword("");
    } catch {
      setMessage("Impossibile effettuare l'accesso. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return (
      <main className="booking-admin">
        <section className="booking-admin__card">
          <span className="booking-admin__eyebrow">STUDIO MARTELLO</span>

          <h1>Accesso effettuato</h1>

          <p>La tua identità è stata verificata tramite Supabase.</p>

          <p className="booking-admin__notice">
            La gestione delle prenotazioni non è ancora disponibile. Dobbiamo
            prima configurare i permessi amministrativi.
          </p>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              setLoggedIn(false);
            }}
          >
            Esci
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-admin">
      <section className="booking-admin__card">
        <span className="booking-admin__eyebrow">STUDIO MARTELLO</span>

        <h1>Area riservata</h1>

        <p>Accedi per gestire le richieste di appuntamento dello studio.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Indirizzo email</label>

          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Inserisci la tua email"
            autoComplete="email"
            required
          />

          <label htmlFor="admin-password">Password</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Inserisci la password"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>

          {message && (
            <p className="booking-admin__notice" role="alert">
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

export default BookingAdminPage;
