import { Routes, Route } from "react-router-dom";
import FormationPage from "./pages/FormationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import SafetyPage from "./pages/SafetyPage.jsx";
import PrivateServicesPage from "./pages/PrivateServicesPage.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/servizi" element={<ServicesPage />} />

      <Route path="/sicurezza-sul-lavoro" element={<SafetyPage />} />
      <Route path="/formazione" element={<FormationPage />} />
      <Route path="/servizi-per-privati" element={<PrivateServicesPage />} />
    </Routes>
  );
};

export default App;
