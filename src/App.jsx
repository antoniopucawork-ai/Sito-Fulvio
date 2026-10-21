import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// ==========================================
// COMPONENTI CONDIVISI
// ==========================================

import ScrollToTop from "./components/ScrollToTop.jsx";
import Footer from "./components/Footer/Footer.jsx";

// ==========================================
// PAGINE CARICATE DINAMICAMENTE
// ==========================================

const HomePage = lazy(() => import("./pages/HomePage.jsx"));

const BookingPage = lazy(() => import("./pages/BookingPage.jsx"));

const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));

const SafetyPage = lazy(() => import("./pages/SafetyPage.jsx"));

const FormationPage = lazy(() => import("./pages/FormationPage.jsx"));

const PrivateServicesPage = lazy(
  () => import("./pages/PrivateServicesPage.jsx"),
);

const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));

const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));

const PrivacyPage = lazy(() => import("./pages/PrivacyPage/PrivacyPage.jsx"));

const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

// ==========================================
// AREA AMMINISTRATIVA
// ==========================================

// La dashboard viene caricata soltanto
// quando viene visitata la rotta /admin.

const BookingAdminPage = lazy(
  () => import("./pages/admin/BookingAdminPage.jsx"),
);

// ==========================================
// SCHERMATA DI CARICAMENTO
// ==========================================

const PageLoader = () => {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
      role="status"
      aria-live="polite"
    >
      <p>Caricamento pagina...</p>
    </main>
  );
};

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

const App = () => {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* HOME */}

          <Route path="/" element={<HomePage />} />

          {/* PRENOTAZIONI */}

          <Route path="/prenotazioni" element={<BookingPage />} />

          {/* SERVIZI */}

          <Route path="/servizi" element={<ServicesPage />} />

          {/* SICUREZZA SUL LAVORO */}

          <Route path="/sicurezza-sul-lavoro" element={<SafetyPage />} />

          {/* FORMAZIONE */}

          <Route path="/formazione" element={<FormationPage />} />

          {/* SERVIZI PER PRIVATI */}

          <Route
            path="/servizi-per-privati"
            element={<PrivateServicesPage />}
          />

          {/* CONTATTI */}

          <Route path="/contatti" element={<ContactPage />} />

          {/* CHI SONO */}

          <Route path="/chi-sono" element={<AboutPage />} />

          {/* PRIVACY */}

          <Route path="/privacy" element={<PrivacyPage />} />

          {/* AREA AMMINISTRATIVA */}

          <Route path="/admin" element={<BookingAdminPage />} />

          {/* PAGINA NON TROVATA */}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
};

export default App;
