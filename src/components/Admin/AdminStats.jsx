import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";

const AdminStats = ({
  stats,
}) => (
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
);

export default AdminStats;
