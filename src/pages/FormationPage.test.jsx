// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import { describe, expect, test, afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

import FormationPage from "./FormationPage.jsx";

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
      name: /contatta fulvio su whatsapp/i,
    });

    expect(whatsappLink).toBeInTheDocument();

    expect(whatsappLink).toHaveAttribute("target", "_blank");
  });

  test("il link WhatsApp contiene il messaggio dedicato alla formazione", () => {
    renderFormationPage();

    const whatsappLink = screen.getByRole("link", {
      name: /contatta fulvio su whatsapp/i,
    });

    const href = whatsappLink.getAttribute("href");

    expect(href).toContain("wa.me");

    expect(decodeURIComponent(href)).toContain(
      "Avrei bisogno di informazioni sui corsi di formazione.",
    );
  });
});
