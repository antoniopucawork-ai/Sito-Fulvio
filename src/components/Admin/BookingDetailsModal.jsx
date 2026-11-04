import { CalendarDays, CheckCircle2, Building2, XCircle, X, Mail, Phone, FileText, UserRound, AlertCircle } from "lucide-react";
import BookingProposalForm from "./BookingProposalForm.jsx";
import { formatDate, formatTime, getTypeConfig, getStatusConfig } from "./adminBookingUtils.js";

const BookingDetailsModal = ({
  selectedBooking,
  dialogRef,
  closeButtonRef,
  modalContentRef,
  proposalFormRef,
  closeBookingDetails,
  isUpdating,
  hasConflict,
  hasActiveProposal,
  conflictingBooking,
  showProposalForm,
  closeProposalForm,
  pendingAction,
  setPendingAction,
  confirmBookingAction,
  openProposalForm,
  handleSaveProposal,
  requestBookingAction,
  actionError,
}) => (
    <div
              className="admin-modal-overlay"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeBookingDetails();
                }
              }}
            >
              <section
                ref={dialogRef}
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-modal-title"
                tabIndex={-1}
              >
                {/* HEADER */}

                <div className="admin-modal__header">
                  <div>
                    <span className="admin-section-eyebrow">
                      DETTAGLI RICHIESTA
                    </span>

                    <h2 id="admin-modal-title">
                      Prenotazione #{selectedBooking.id}
                    </h2>
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="admin-modal__close"
                    onClick={closeBookingDetails}
                    disabled={isUpdating}
                    aria-label="Chiudi dettagli"
                  >
                    <X size={21} />
                  </button>
                </div>

                {/* CONTENUTO */}

                <div ref={modalContentRef} className="admin-modal__content">
                  {/* CLIENTE */}

                  <div className="admin-modal__section">
                    <h3>
                      <UserRound size={19} />
                      Informazioni cliente
                    </h3>

                    <div className="admin-modal__info">
                      <span>Nome e cognome</span>

                      <strong>
                        {selectedBooking.first_name} {selectedBooking.last_name}
                      </strong>
                    </div>

                    <div className="admin-modal__info">
                      <span>
                        <Mail size={16} />
                        Email
                      </span>

                      {selectedBooking.email ? (
                        <a href={`mailto:${selectedBooking.email}`}>
                          {selectedBooking.email}
                        </a>
                      ) : (
                        <strong>Non disponibile</strong>
                      )}
                    </div>

                    <div className="admin-modal__info">
                      <span>
                        <Phone size={16} />
                        Telefono
                      </span>

                      {selectedBooking.phone ? (
                        <a href={`tel:${selectedBooking.phone}`}>
                          {selectedBooking.phone}
                        </a>
                      ) : (
                        <strong>Non disponibile</strong>
                      )}
                    </div>
                  </div>

                  {/* APPUNTAMENTO */}

                  <div className="admin-modal__section">
                    <h3>
                      <CalendarDays size={19} />
                      Informazioni appuntamento
                    </h3>

                    <div className="admin-modal__info">
                      <span>Data richiesta</span>

                      <strong>
                        {formatDate(selectedBooking.appointment_date)}
                      </strong>
                    </div>

                    <div className="admin-modal__info">
                      <span>Ora richiesta</span>

                      <strong>
                        {formatTime(selectedBooking.appointment_time)}
                      </strong>
                    </div>

                    <div className="admin-modal__info">
                      <span>Durata</span>

                      <strong>
                        {selectedBooking.duration_minutes
                          ? `${selectedBooking.duration_minutes} minuti`
                          : "Non disponibile"}
                      </strong>
                    </div>

                    <div className="admin-modal__info">
                      <span>Modalità</span>

                      <strong>
                        {getTypeConfig(selectedBooking.appointment_type).label}
                      </strong>
                    </div>

                    <div className="admin-modal__info">
                      <span>Stato</span>

                      <strong>
                        {getStatusConfig(selectedBooking.status).label}
                      </strong>
                    </div>
                  </div>

                  {/* AZIENDA */}

                  {selectedBooking.appointment_type === "azienda" && (
                    <div className="admin-modal__section">
                      <h3>
                        <Building2 size={19} />
                        Informazioni azienda
                      </h3>

                      <div className="admin-modal__info">
                        <span>Nome azienda</span>

                        <strong>
                          {selectedBooking.company_name || "Non disponibile"}
                        </strong>
                      </div>

                      <div className="admin-modal__info">
                        <span>Indirizzo</span>

                        <strong>
                          {selectedBooking.company_address || "Non disponibile"}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* NOTE */}

                  <div className="admin-modal__section">
                    <h3>
                      <FileText size={19} />
                      Note del cliente
                    </h3>

                    <p className="admin-modal__notes">
                      {selectedBooking.notes || "Nessuna nota inserita."}
                    </p>
                  </div>

                  {/* CONFLITTO */}

                  {selectedBooking.status === "pending" && hasConflict && (
                    <div className="admin-modal__confirmation" role="alert">
                      <AlertCircle size={21} />

                      <div>
                        <strong>Orario già occupato</strong>

                        <p>
                          Il {formatDate(selectedBooking.appointment_date)} alle{" "}
                          {formatTime(selectedBooking.appointment_time)} è già
                          presente un appuntamento confermato con{" "}
                          <strong>
                            {conflictingBooking.first_name}{" "}
                            {conflictingBooking.last_name}
                          </strong>
                          .
                        </p>

                        <p>
                          Puoi rifiutare questa richiesta oppure proporre un nuovo
                          orario.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BOZZA PROPOSTA */}

                  {selectedBooking.proposal_status === "draft" &&
                    !showProposalForm && (
                      <div className="admin-modal__confirmation" role="status">
                        <CalendarDays size={21} />

                        <div>
                          <strong>Bozza proposta salvata</strong>

                          <p>
                            Nuovo appuntamento:{" "}
                            {formatDate(selectedBooking.proposed_date)} alle{" "}
                            {formatTime(selectedBooking.proposed_time)}.
                          </p>

                          {selectedBooking.proposal_note && (
                            <p>Nota: {selectedBooking.proposal_note}</p>
                          )}

                          <p>La proposta non è ancora stata inviata al cliente.</p>
                        </div>
                      </div>
                    )}

                  {/* PROPOSTA INVIATA */}

                  {selectedBooking.proposal_status === "sent" && (
                    <div className="admin-modal__confirmation" role="status">
                      <Mail size={21} />

                      <div>
                        <strong>Proposta inviata al cliente</strong>

                        <p>
                          {formatDate(selectedBooking.proposed_date)} alle{" "}
                          {formatTime(selectedBooking.proposed_time)}.
                        </p>

                        <p>In attesa della risposta del cliente.</p>
                      </div>
                    </div>
                  )}

                  {/* PROPOSTA ACCETTATA */}

                  {selectedBooking.proposal_status === "accepted" && (
                    <div className="admin-modal__confirmation" role="status">
                      <CheckCircle2 size={21} />

                      <div>
                        <strong>Proposta accettata dal cliente</strong>

                        <p>
                          Data proposta: {formatDate(selectedBooking.proposed_date)}{" "}
                          alle {formatTime(selectedBooking.proposed_time)}.
                        </p>

                        <p>
                          L'appuntamento originale non è stato modificato
                          automaticamente.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MODULO PROPOSTA */}

                  {selectedBooking.status === "pending" && showProposalForm && (
                    <div ref={proposalFormRef} className="admin-proposal-container">
                      <BookingProposalForm
                        key={selectedBooking.id}
                        booking={selectedBooking}
                        onSave={handleSaveProposal}
                        onCancel={closeProposalForm}
                        saving={isUpdating}
                      />
                    </div>
                  )}

                  {/* CONFERMA OPERAZIONE */}

                  {pendingAction && (
                    <div className="admin-modal__confirmation" role="alert">
                      <AlertCircle size={21} />

                      <div>
                        <strong>
                          {pendingAction === "confirmed"
                            ? "Confermare questo appuntamento?"
                            : "Rifiutare questa richiesta?"}
                        </strong>

                        <p>
                          {pendingAction === "confirmed"
                            ? "La prenotazione verrà contrassegnata come confermata."
                            : "La richiesta verrà contrassegnata come rifiutata."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ERRORI OPERAZIONE */}

                  {actionError && (
                    <div className="admin-feedback" role="alert">
                      {actionError}
                    </div>
                  )}
                </div>

                {/* ==================================
                    PULSANTI MODALE
                ================================== */}

                <div className="admin-modal__footer">
                  {selectedBooking.status === "pending" ? (
                    showProposalForm ? (
                      <button
                        type="button"
                        className="admin-modal__button admin-modal__button--secondary"
                        onClick={closeProposalForm}
                        disabled={isUpdating}
                      >
                        Chiudi proposta
                      </button>
                    ) : pendingAction ? (
                      <>
                        <button
                          type="button"
                          className="admin-modal__button admin-modal__button--secondary"
                          onClick={() => {
                            setPendingAction(null);
                          }}
                          disabled={isUpdating}
                        >
                          Indietro
                        </button>

                        <button
                          type="button"
                          className={`admin-modal__button ${
                            pendingAction === "confirmed"
                              ? "admin-modal__button--approve"
                              : "admin-modal__button--reject"
                          }`}
                          onClick={confirmBookingAction}
                          disabled={
                            isUpdating ||
                            (pendingAction === "confirmed" &&
                              (hasConflict || hasActiveProposal))
                          }
                        >
                          {isUpdating
                            ? "Salvataggio..."
                            : pendingAction === "confirmed"
                              ? "Conferma approvazione"
                              : "Conferma rifiuto"}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* PROPOSTA */}

                        {selectedBooking.proposal_status !== "sent" &&
                          selectedBooking.proposal_status !== "accepted" && (
                            <button
                              type="button"
                              className="admin-modal__button admin-modal__button--secondary"
                              onClick={openProposalForm}
                              disabled={isUpdating}
                            >
                              <CalendarDays size={18} />

                              {selectedBooking.proposal_status === "draft"
                                ? "Modifica proposta"
                                : "Proponi nuovo orario"}
                            </button>
                          )}

                        {/* RIFIUTO */}

                        <button
                          type="button"
                          className="admin-modal__button admin-modal__button--reject"
                          onClick={() => {
                            requestBookingAction("rejected");
                          }}
                          disabled={isUpdating}
                        >
                          <XCircle size={18} />
                          Rifiuta
                        </button>

                        {/* APPROVAZIONE */}

                        <button
                          type="button"
                          className="admin-modal__button admin-modal__button--approve"
                          onClick={() => {
                            requestBookingAction("confirmed");
                          }}
                          disabled={
                            isUpdating ||
                            hasConflict ||
                            hasActiveProposal
                          }
                        >
                          <CheckCircle2 size={18} />
                          Approva
                        </button>
                      </>
                    )
                  ) : (
                    <button
                      type="button"
                      className="admin-modal__button admin-modal__button--secondary"
                      onClick={closeBookingDetails}
                      disabled={isUpdating}
                    >
                      Chiudi
                    </button>
                  )}
                </div>
              </section>
            </div>
);

export default BookingDetailsModal;
