import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <>
      <Navbar />

      <main className="not-found">
        <div className="not-found__content">
          <span className="not-found__code">404</span>

          <h1>Pagina non trovata</h1>

          <p>
            La pagina che stai cercando non esiste oppure non è più disponibile.
          </p>

          <Link to="/" className="not-found__button">
            <ArrowLeft size={18} />
            Torna alla Home
          </Link>
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
