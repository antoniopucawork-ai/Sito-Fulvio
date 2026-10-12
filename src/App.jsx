import { Routes, Route } from "react-router-dom";

import FormationPage from "./pages/FormationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import SafetyPage from "./pages/SafetyPage.jsx";
import PrivateServicesPage from "./pages/PrivateServicesPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PrivacyPage from "./pages/PrivacyPage/PrivacyPage.jsx";

import ScrollToTop from "./components/ScrollToTop.jsx";
import Footer from "./components/Footer/Footer.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const App = () => {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        <Route path="/sicurezza-sul-lavoro" element={<SafetyPage />} />
        <Route path="/formazione" element={<FormationPage />} />
        <Route path="/servizi-per-privati" element={<PrivateServicesPage />} />
        <Route path="/contatti" element={<ContactPage />} />
        <Route path="/chi-sono" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
