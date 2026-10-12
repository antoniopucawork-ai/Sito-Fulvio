// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import FormationPage from "./FormationPage.jsx";
import { contactConfig } from "../data/contactConfig.js";

afterEach(() => {
  cleanup();
});

const renderFormationPage = () => {
  return render(
    <MemoryRouter>
      <FormationPage />
    </MemoryRouter>,
  );
};

describe("FormationPage", () => {
  test("mostra il titolo principale della pagina formazione", () => {
    renderFormationPage();

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la formazione giusta per lavorare\s*in sicurezza/i,
    );
  });

  test("mostra le quattro aree formative principali", () => {
    renderFormationPage();

    expect(
      screen.getByRole("heading", {
        name: /formazione per lavoratori, preposti e dirigenti/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /rls, rspp e figure della sicurezza/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /attrezzature e mansioni specifiche/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /formazione specialistica/i,
      }),
    ).toBeInTheDocument();
  });

  test("mostra alcuni corsi specifici", () => {
    renderFormationPage();

    expect(screen.getByText("Carrelli elevatori")).toBeInTheDocument();

    expect(screen.getByText("Spazi confinati")).toBeInTheDocument();

    expect(screen.getByText("Antincendio")).toBeInTheDocument();

    expect(screen.getByText("Primo soccorso")).toBeInTheDocument();
  });

  test("mostra le modalità di erogazione della formazione", () => {
    renderFormationPage();

    expect(
      screen.getByText("Formazione in aula presso l'azienda"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Formazione a distanza, ove consentito"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Formazione pratica in cantieri e impianti"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("E-learning con piattaforma dedicata"),
    ).toBeInTheDocument();
  });

  test("mostra il pulsante WhatsApp finale", () => {
    renderFormationPage();

    const whatsappLink = screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    });

    expect(whatsappLink).toBeInTheDocument();

    expect(whatsappLink).toHaveAttribute("target", "_blank");

    expect(whatsappLink).toHaveAttribute("rel", "noreferrer");
  });

  test("il link WhatsApp contiene il messaggio dedicato alla formazione", () => {
    renderFormationPage();

    const whatsappLink = screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    });

    const href = whatsappLink.getAttribute("href");

    expect(href).toBeTruthy();

    const url = new URL(href);

    // Verifica che il collegamento punti a WhatsApp
    expect(url.origin).toBe("https://wa.me");

    // Verifica il numero configurato
    expect(url.pathname).toBe(`/${contactConfig.whatsappNumber}`);

    // Recupera il messaggio WhatsApp
    const message = url.searchParams.get("text");

    expect(message).toBeTruthy();

    // Verifica il saluto professionale
    expect(message).toContain(`Salve ${contactConfig.professionalName}`);

    // Verifica il contenuto dedicato alla formazione
    expect(message).toContain(
      "Avrei bisogno di informazioni sui corsi di formazione",
    );

    expect(message).toContain("e sui percorsi disponibili per la mia azienda.");

    // Verifica che sia presente lo spazio per descrivere l'esigenza
    expect(message).toContain("La mia esigenza è:");
  });
});
