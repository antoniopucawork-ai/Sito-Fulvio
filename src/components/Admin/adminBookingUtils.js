import { Clock3, CheckCircle2, XCircle, Video, MapPin, Building2 } from "lucide-react";

// ==========================================
// CONFIGURAZIONE
// ==========================================

export const STATUS_CONFIG = {
  pending: {
    label: "In attesa",
    icon: Clock3,
  },
  confirmed: {
    label: "Confermata",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rifiutata",
    icon: XCircle,
  },
  cancelled: {
    label: "Annullata",
    icon: XCircle,
  },
};

export const TYPE_CONFIG = {
  video: {
    label: "Videochiamata",
    icon: Video,
  },
  studio: {
    label: "Presso lo studio",
    icon: MapPin,
  },
  azienda: {
    label: "Presso l'azienda",
    icon: Building2,
  },
};

export const FILTERS = [
  { id: "all", label: "Tutte" },
  { id: "pending", label: "In attesa" },
  { id: "confirmed", label: "Confermate" },
  { id: "rejected", label: "Rifiutate" },
];

// ==========================================
// FORMATTAZIONE
// ==========================================

export const formatDate = (date) => {
  if (!date) return "Data non disponibile";

  const [year, month, day] = String(date).split("-").map(Number);

  if (!year || !month || !day) {
    return "Data non valida";
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "Data non valida";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

export const formatTime = (time) => {
  if (!time) return "--:--";

  return String(time).slice(0, 5);
};

export const getStatusGroup = (status) => {
  if (status === "confirmed") return "confirmed";

  if (status === "rejected" || status === "cancelled") {
    return "rejected";
  }

  return "pending";
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
};

export const getTypeConfig = (type) => {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.studio;
};

// ==========================================
// CONTROLLO CONFLITTI
// ==========================================

export const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const TRAVEL_BUFFER_MINUTES = 90;

const getEffectiveInterval = (booking) => {
  const start = timeToMinutes(booking.appointment_time);
  const duration = Number(booking.duration_minutes);

  if (start === null || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  const buffer =
    booking.appointment_type === "azienda" ? TRAVEL_BUFFER_MINUTES : 0;

  return {
    start: start - buffer,
    end: start + duration + buffer,
  };
};

export const findBookingConflict = (booking, bookings) => {
  if (!booking) return null;

  const requested = getEffectiveInterval(booking);

  if (!requested) return null;

  return (
    bookings.find((other) => {
      if (other.id === booking.id) return false;

      if (other.status !== "confirmed") {
        return false;
      }

      if (other.appointment_date !== booking.appointment_date) {
        return false;
      }

      const occupied = getEffectiveInterval(other);

      if (!occupied) return false;

      // Intervalli a contatto sono consecutivi, senza sovrapposizione.
      return requested.start < occupied.end && requested.end > occupied.start;
    }) ?? null
  );
};
