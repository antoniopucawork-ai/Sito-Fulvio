import { CalendarDays, LayoutDashboard, LogOut } from "lucide-react";

const AdminSidebar = ({
  activeSection,
  setActiveSection,
  setActiveFilter,
  onLogout,
  isUpdating,
}) => (
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
);

export default AdminSidebar;
