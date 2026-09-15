// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import App from "./App.jsx";

afterEach(() => {
  cleanup();
});

const renderAppAtRoute = (route) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
};

describe("App routing", () => {
  test("la route / mostra la Home", () => {
    renderAppAtRoute("/");

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /soluzioni professionali,\s*spiegate in modo semplice/i,
    );
  });

  test("la route /servizi mostra la pagina Servizi", () => {
    renderAppAtRoute("/servizi");

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(/come possiamo aiutarti/i);
  });

  test("la route /sicurezza-sul-lavoro mostra la pagina Sicurezza", () => {
    renderAppAtRoute("/sicurezza-sul-lavoro");

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la sicurezza della tua azienda,\s*spiegata in modo semplice/i,
    );
  });

  test("la route /formazione mostra la pagina Formazione", () => {
    renderAppAtRoute("/formazione");

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la formazione giusta per lavorare\s*in sicurezza/i,
    );
  });
});
