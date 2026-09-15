// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { describe, expect, test, afterEach, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

import ServicesPage from "./ServicesPage.jsx";

/* =========================
   MOCK BROWSER FUNCTIONS
========================= */

Element.prototype.scrollIntoView = vi.fn();

window.scrollTo = vi.fn();

/* =========================
   CLEANUP
========================= */

afterEach(() => {
  cleanup();
});

/* =========================
   RENDER
========================= */

const renderServicesPage = () => {
  return render(
    <MemoryRouter>
      <ServicesPage />
    </MemoryRouter>,
  );
};

/* =========================
   TESTS
========================= */

describe("ServicesPage", () => {
  test("mostra le due scelte iniziali Aziende e Privati", () => {
    renderServicesPage();

    expect(
      screen.getByRole("heading", {
        name: /servizi per aziende/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /servizi per privati/i,
      }),
    ).toBeInTheDocument();
  });

  test("permette di entrare nel catalogo delle aziende", async () => {
    const user = userEvent.setup();

    renderServicesPage();

    const companiesButton = screen.getByRole("button", {
      name: /servizi per aziende/i,
    });

    await user.click(companiesButton);

    expect(
      screen.getByText(/scegli l'area che vuoi consultare/i),
    ).toBeInTheDocument();
  });

  test("segue il percorso Aziende → Sicurezza sul lavoro → Valutazione dei rischi", async () => {
    const user = userEvent.setup();

    renderServicesPage();

    await user.click(
      screen.getByRole("button", {
        name: /servizi per aziende/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /sicurezza sul lavoro/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /sicurezza sul lavoro/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /valutazione dei rischi/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /valutazione dei rischi/i,
      }),
    ).toBeInTheDocument();
  });

  test("permette di selezionare Valutazione completa dei rischi aziendali", async () => {
    const user = userEvent.setup();

    renderServicesPage();

    await user.click(
      screen.getByRole("button", {
        name: /servizi per aziende/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /sicurezza sul lavoro/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /valutazione dei rischi/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /valutazione completa dei rischi aziendali/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /valutazione completa dei rischi aziendali/i,
      }),
    ).toBeInTheDocument();
  });

  test("genera il link WhatsApp con il percorso completo selezionato", async () => {
    const user = userEvent.setup();

    renderServicesPage();

    await user.click(
      screen.getByRole("button", {
        name: /servizi per aziende/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /sicurezza sul lavoro/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /valutazione dei rischi/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /valutazione completa dei rischi aziendali/i,
      }),
    );

    const whatsappLink = screen.getByRole("link", {
      name: /contatta fulvio su whatsapp/i,
    });

    expect(whatsappLink).toBeInTheDocument();

    const href = whatsappLink.getAttribute("href");

    expect(href).toContain("wa.me");

    const decodedHref = decodeURIComponent(href);

    expect(decodedHref).toContain("Valutazione completa dei rischi aziendali");

    expect(decodedHref).toContain(
      "Aziende → Sicurezza sul lavoro → Valutazione dei rischi → Valutazione completa dei rischi aziendali",
    );
  });
});
