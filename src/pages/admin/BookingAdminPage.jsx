import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import AdminDashboard from "../../components/Admin/AdminDashboard.jsx";
import "./BookingAdminPage.css";

// ==========================================
// CONFIGURAZIONE
// ==========================================

const ALLOWED_STATUSES = ["confirmed", "rejected"];

const BOOKING_FIELDS = `
  id,
  created_at,
  first_name,
  last_name,
  email,
  phone,
  appointment_type,
  appointment_date,
  appointment_time,
  duration_minutes,
  status,
  company_name,
  company_address,
  notes,
  approved_by,
  approved_at,
  updated_at,
  google_event_id,
  proposed_date,
  proposed_time,
  proposal_note,
  proposal_sent_at,
  proposal_status
`;

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

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
  // STATO AGGIORNAMENTO PRENOTAZIONI
  // ==========================================

  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const [bookingActionError, setBookingActionError] = useState("");

  const [bookingActionSuccess, setBookingActionSuccess] = useState("");

  // Impedisce richieste contemporanee anche prima
  // che React aggiorni lo stato del componente.

  const updatingRef = useRef(false);

  // ==========================================
  // VERIFICA PERMESSI AMMINISTRATORE
  // ==========================================

  const verifyAdmin = useCallback(async (user) => {
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Errore verifica amministratore:", error);

      throw new Error("Impossibile verificare i permessi di accesso.");
    }

    return Boolean(data);
  }, []);

  // ==========================================
  // VERIFICA SESSIONE INIZIALE
  // ==========================================

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        const authorized = await verifyAdmin(user);

        if (!active) return;

        setIsAdmin(authorized);

        if (user && !authorized) {
          setMessage("Non hai i permessi per accedere a quest'area.");
        }
      } catch (error) {
        console.error("Errore inizializzazione sessione:", error);

        if (active) {
          setMessage("Impossibile verificare la sessione.");

          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    void initialize();

    // ==========================================
    // ASCOLTO CAMBIAMENTI AUTENTICAZIONE
    // ==========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        setIsAdmin(false);

        setBookings([]);

        setBookingsError("");

        setBookingActionError("");

        setBookingActionSuccess("");

        setCheckingSession(false);
      }
    });

    return () => {
      active = false;

      subscription.unsubscribe();
    };
  }, [verifyAdmin]);

  // ==========================================
  // LOGIN AMMINISTRATORE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("Email o password non corretti.");

        return;
      }

      const authorized = await verifyAdmin(data.user);

      if (!authorized) {
        await supabase.auth.signOut();

        setMessage("Non hai i permessi per accedere a quest'area.");

        return;
      }

      setIsAdmin(true);

      setPassword("");

      setMessage("");
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
        .select(BOOKING_FIELDS)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setBookings(data ?? []);

      return true;
    } catch (error) {
      console.error("Errore caricamento prenotazioni:", error);

      setBookingsError("Impossibile caricare le prenotazioni. Riprova.");

      return false;
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // ==========================================
  // CARICAMENTO AUTOMATICO
  // ==========================================

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
  // AGGIORNAMENTO PRENOTAZIONE
  // ==========================================

  const handleUpdateBooking = async (bookingId, newStatus) => {
    // Controllo stato richiesto

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      setBookingActionError("Operazione non consentita.");

      return false;
    }

    // Impedisce operazioni contemporanee

    if (updatingRef.current) {
      return false;
    }

    // Verifica identificativo

    if (!Number.isSafeInteger(Number(bookingId)) || Number(bookingId) <= 0) {
      setBookingActionError("Identificativo prenotazione non valido.");

      return false;
    }

    updatingRef.current = true;

    setUpdatingBookingId(bookingId);

    setBookingActionError("");

    setBookingActionSuccess("");

    try {
      // ======================================
      // 1. VERIFICA UTENTE
      // ======================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sessione scaduta. Effettua nuovamente l'accesso.");
      }

      // ======================================
      // 2. VERIFICA AMMINISTRATORE
      // ======================================

      const authorized = await verifyAdmin(user);

      if (!authorized) {
        throw new Error("Non hai i permessi per modificare le prenotazioni.");
      }

      // ======================================
      // 3. PREPARAZIONE AGGIORNAMENTO
      // ======================================

      const now = new Date().toISOString();

      const updates = {
        status: newStatus,

        updated_at: now,

        approved_by: newStatus === "confirmed" ? user.id : null,

        approved_at: newStatus === "confirmed" ? now : null,
      };

      // ======================================
      // 4. AGGIORNAMENTO DATABASE
      // ======================================

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .eq("status", "pending")
        .select("id, status")
        .maybeSingle();

      // ======================================
      // 5. GESTIONE ERRORI DATABASE
      // ======================================

      if (error) {
        // Sovrapposizione appuntamenti

        if (error.code === "23P01") {
          throw new Error(
            "Impossibile confermare: esiste già un appuntamento confermato in questo orario.",
          );
        }

        // Violazione vincoli database

        if (error.code === "23514") {
          throw new Error(
            "La modifica non rispetta le regole del sistema di prenotazione.",
          );
        }

        throw error;
      }

      // Nessuna prenotazione modificata

      if (!data) {
        throw new Error(
          "La richiesta non è più in attesa oppure non è disponibile. Aggiorna l'elenco.",
        );
      }

      // ======================================
      // 6. AGGIORNAMENTO INTERFACCIA
      // ======================================

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === data.id
            ? {
                ...booking,
                ...updates,
              }
            : booking,
        ),
      );

      // ======================================
      // 7. MESSAGGIO DI CONFERMA
      // ======================================

      if (newStatus === "confirmed") {
        setBookingActionSuccess("Appuntamento confermato correttamente.");
      } else {
        setBookingActionSuccess("Richiesta rifiutata correttamente.");
      }

      // ======================================
      // 8. SINCRONIZZAZIONE DATABASE
      // ======================================

      await loadBookings();

      return true;
    } catch (error) {
      console.error("Errore aggiornamento prenotazione:", error);

      setBookingActionError(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare la prenotazione.",
      );

      return false;
    } finally {
      updatingRef.current = false;

      setUpdatingBookingId(null);
    }
  };
  // ==========================================
  // SALVATAGGIO PROPOSTA NUOVO ORARIO
  // ==========================================

  const handleProposeBooking = async (
    bookingId,
    proposedDate,
    proposedTime,
    proposalNote = "",
  ) => {
    if (updatingRef.current) {
      return false;
    }

    if (!Number.isSafeInteger(Number(bookingId)) || Number(bookingId) <= 0) {
      setBookingActionError("Identificativo prenotazione non valido.");
      return false;
    }

    updatingRef.current = true;

    setUpdatingBookingId(bookingId);
    setBookingActionError("");
    setBookingActionSuccess("");

    try {
      // Recupera la sessione corrente.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sessione scaduta. Effettua nuovamente l'accesso.");
      }

      // Invia la proposta al backend protetto.
      const response = await fetch("/.netlify/functions/propose-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bookingId: Number(bookingId),
          proposedDate,
          proposedTime,
          proposalNote,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Impossibile salvare la proposta.");
      }

      // Ricarica i dati aggiornati da Supabase.
      const refreshed = await loadBookings();

      if (!refreshed) {
        throw new Error(
          "Proposta salvata, ma non è stato possibile aggiornare l'elenco. Premi Aggiorna.",
        );
      }

      setBookingActionSuccess(
        "Bozza della proposta salvata correttamente. Nessuna email è stata inviata.",
      );

      return true;
    } catch (error) {
      console.error("Errore salvataggio proposta:", error);

      setBookingActionError(
        error instanceof Error
          ? error.message
          : "Impossibile salvare la proposta.",
      );

      return false;
    } finally {
      updatingRef.current = false;
      setUpdatingBookingId(null);
    }
  };
  // ==========================================
  // AGGIORNAMENTO MANUALE
  // ==========================================

  const handleRefresh = async () => {
    setBookingActionError("");

    setBookingActionSuccess("");

    await loadBookings();
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setIsAdmin(false);

      setBookings([]);

      setBookingsError("");

      setBookingActionError("");

      setBookingActionSuccess("");

      setUpdatingBookingId(null);

      setEmail("");

      setPassword("");
    } catch (error) {
      console.error("Errore logout:", error);

      setBookingActionError("Impossibile disconnettersi. Riprova.");
    }
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
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        onUpdateBooking={handleUpdateBooking}
        onProposeBooking={handleProposeBooking}
        updatingBookingId={updatingBookingId}
        actionError={bookingActionError}
        actionSuccess={bookingActionSuccess}
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
          {/* EMAIL */}

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

          {/* PASSWORD */}

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

          {/* ACCESSO */}

          <button type="submit" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>

          {/* MESSAGGI */}

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
