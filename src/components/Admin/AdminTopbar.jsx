import { RefreshCw } from "lucide-react";

const AdminTopbar = ({
  activeSection,
  onRefresh,
  loading,
  isUpdating,
}) => (
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
);

export default AdminTopbar;
