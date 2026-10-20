import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import AdminDashboard from "../../components/Admin/AdminDashboard.jsx";
import "./BookingAdminPage.css";

const BookingAdminPage = () => {
  // ==========================================
  // STATO LOGIN
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ==========================================
  // STATO PRENOTAZIONI
  // ==========================================

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // ==========================================
  // VERIFICA SESSIONE E PERMESSI
  // ==========================================

  useEffect(() => {
    let active = true;

    const checkAdmin = async (user) => {
      if (!user) {
        if (active) {
          setIsAdmin(false);
          setCheckingSession(false);
        }

        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Errore verifica amministratore:", error);

        setMessage("Impossibile verificare i permessi di accesso.");

        setIsAdmin(false);
        setCheckingSession(false);

        return;
      }

      setIsAdmin(Boolean(data));
      setCheckingSession(false);
    };

    const initialize = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (error) {
          setMessage("Impossibile verificare la sessione.");

          await checkAdmin(null);
          return;
        }

        await checkAdmin(user);
      } catch (error) {
        console.error("Errore inizializzazione sessione:", error);

        if (active) {
          setMessage("Impossibile verificare la sessione.");

          setIsAdmin(false);
          setCheckingSession(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        setIsAdmin(false);
        setBookings([]);
        setBookingsError("");
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // LOGIN AMMINISTRATORE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Email o password non corretti.");

        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();

        setMessage("Non hai i permessi per accedere a quest'area.");

        return;
      }

      setIsAdmin(true);
      setPassword("");
    } catch (error) {
      console.error("Errore durante il login:", error);

      setMessage("Impossibile effettuare l'accesso. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CARICAMENTO PRENOTAZIONI
  // ==========================================

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError("");

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
            id,
            first_name,
            last_name,
            appointment_type,
            appointment_date,
            appointment_time,
            status
          `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setBookings(data ?? []);
    } catch (error) {
      console.error("Errore caricamento prenotazioni:", error);

      setBookingsError("Impossibile caricare le prenotazioni. Riprova.");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // CARICAMENTO AUTOMATICO

  useEffect(() => {
    if (!isAdmin) return;

    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAdmin, loadBookings]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Impossibile disconnettersi. Riprova.");

      return;
    }

    setIsAdmin(false);
    setBookings([]);
    setBookingsError("");

    setEmail("");
    setPassword("");
  };

  // ==========================================
  // VERIFICA SESSIONE IN CORSO
  // ==========================================

  if (checkingSession) {
    return (
      <main className="booking-admin">
        <section className="booking-admin__card">
          <span className="booking-admin__eyebrow">STUDIO MARTELLO</span>

          <h1>Area riservata</h1>

          <p>Verifica dell'accesso in corso...</p>
        </section>
      </main>
    );
  }

  // ==========================================
  // DASHBOARD AMMINISTRATIVA
  // ==========================================

  if (isAdmin) {
    return (
      <AdminDashboard
        bookings={bookings}
        loading={bookingsLoading}
        error={bookingsError}
        onRefresh={loadBookings}
        onLogout={handleLogout}
      />
    );
  }

  // ==========================================
  // PAGINA LOGIN
  // ==========================================

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
