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
  test("la route / mostra la Home", async () => {
    renderAppAtRoute("/");

    const mainTitle = await screen.findByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /soluzioni professionali,\s*spiegate in modo semplice/i,
    );
  });

  test("la route /servizi mostra la pagina Servizi", async () => {
    renderAppAtRoute("/servizi");

    const mainTitle = await screen.findByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(/come possiamo aiutarti/i);
  });

  test("la route /sicurezza-sul-lavoro mostra la pagina Sicurezza", async () => {
    renderAppAtRoute("/sicurezza-sul-lavoro");

    const mainTitle = await screen.findByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la sicurezza della tua azienda,\s*spiegata in modo semplice/i,
    );
  });

  test("la route /formazione mostra la pagina Formazione", async () => {
    renderAppAtRoute("/formazione");

    const mainTitle = await screen.findByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la formazione giusta per lavorare\s*in sicurezza/i,
    );
  });
});
