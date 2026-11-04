import { CalendarDays, Clock3, ChevronRight } from "lucide-react";
import { FILTERS, getStatusGroup, getStatusConfig, getTypeConfig, formatDate, formatTime } from "./adminBookingUtils.js";

const AdminBookingList = ({
  filteredBookings,
  activeFilter,
  setActiveFilter,
  error,
  loading,
  openBookingDetails,
}) => (
    <section className="admin-bookings">
                  <div className="admin-bookings__heading">
                    <div>
                      <span className="admin-section-eyebrow">
                        GESTIONE RICHIESTE
                      </span>

                      <h2>Appuntamenti</h2>

                      <p>Visualizza e gestisci le richieste inviate dai clienti.</p>
                    </div>

                    <span className="admin-bookings__count">
                      {filteredBookings.length} richieste
                    </span>
                  </div>

                  {/* FILTRI */}

                  <div
                    className="admin-filters"
                    role="group"
                    aria-label="Filtra prenotazioni"
                  >
                    {FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        className={`admin-filter ${
                          activeFilter === filter.id ? "is-active" : ""
                        }`}
                        onClick={() => {
                          setActiveFilter(filter.id);
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* ERRORI */}

                  {error && (
                    <div className="admin-feedback" role="alert">
                      {error}
                    </div>
                  )}

                  {/* CARICAMENTO */}

                  {loading && (
                    <div className="admin-feedback" role="status">
                      Caricamento delle prenotazioni...
                    </div>
                  )}

                  {/* LISTA VUOTA */}

                  {!loading && !error && filteredBookings.length === 0 && (
                    <div className="admin-empty">
                      <CalendarDays size={32} />

                      <h3>Nessuna richiesta presente</h3>

                      <p>Non ci sono appuntamenti per il filtro selezionato.</p>
                    </div>
                  )}

                  {/* ELENCO PRENOTAZIONI */}

                  {!loading && !error && filteredBookings.length > 0 && (
                    <div className="admin-bookings__list">
                      {filteredBookings.map((booking) => {
                        const statusGroup = getStatusGroup(booking.status);

                        const status = getStatusConfig(booking.status);

                        const type = getTypeConfig(booking.appointment_type);

                        const StatusIcon = status.icon;

                        const TypeIcon = type.icon;

                        return (
                          <article className="admin-booking-card" key={booking.id}>
                            {/* CLIENTE */}

                            <div className="admin-booking-card__identity">
                              <div className="admin-booking-card__avatar">
                                {booking.first_name?.charAt(0)?.toUpperCase()}

                                {booking.last_name?.charAt(0)?.toUpperCase()}
                              </div>

                              <div>
                                <h3>
                                  {booking.first_name} {booking.last_name}
                                </h3>

                                <span>Richiesta #{booking.id}</span>
                              </div>
                            </div>

                            {/* STATO */}

                            <div
                              className={`admin-status admin-status--${statusGroup}`}
                            >
                              <StatusIcon size={15} />
                              {status.label}
                            </div>

                            {/* DETTAGLI */}

                            <div className="admin-booking-card__details">
                              <div>
                                <CalendarDays size={18} />

                                <span>{formatDate(booking.appointment_date)}</span>
                              </div>

                              <div>
                                <Clock3 size={18} />

                                <span>{formatTime(booking.appointment_time)}</span>
                              </div>

                              <div>
                                <TypeIcon size={18} />

                                <span>{type.label}</span>
                              </div>
                            </div>

                            {/* AZIONI */}

                            <div className="admin-booking-card__bottom">
                              <span>
                                {booking.status === "pending"
                                  ? "In attesa di approvazione"
                                  : status.label}
                              </span>

                              <button
                                type="button"
                                className="admin-booking-card__details-link"
                                onClick={() => {
                                  openBookingDetails(booking.id);
                                }}
                              >
                                Gestione dettagli
                                <ChevronRight size={17} />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
);

export default AdminBookingList;
