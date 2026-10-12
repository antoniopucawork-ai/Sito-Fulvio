// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import ServicesPage from "./ServicesPage.jsx";
import { contactConfig } from "../data/contactConfig.js";

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
   HELPER PERCORSO AZIENDE
========================= */

const completeCompanyPath = async (user) => {
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

    await user.click(
      screen.getByRole("button", {
        name: /servizi per aziende/i,
      }),
    );

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

    await completeCompanyPath(user);

    expect(
      screen.getByRole("heading", {
        name: /valutazione completa dei rischi aziendali/i,
      }),
    ).toBeInTheDocument();
  });

  test("genera il link WhatsApp con il percorso completo selezionato", async () => {
    const user = userEvent.setup();

    renderServicesPage();

    await completeCompanyPath(user);

    const whatsappLink = screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    });

    expect(whatsappLink).toBeInTheDocument();

    expect(whatsappLink).toHaveAttribute("target", "_blank");

    const href = whatsappLink.getAttribute("href");

    expect(href).toBeTruthy();

    const url = new URL(href);

    // Verifica il collegamento WhatsApp
    expect(url.origin).toBe("https://wa.me");

    // Verifica il numero configurato
    expect(url.pathname).toBe(`/${contactConfig.whatsappNumber}`);

    // Recupera il messaggio WhatsApp
    const message = url.searchParams.get("text");

    expect(message).toBeTruthy();

    // Verifica il saluto professionale
    expect(message).toContain(`Salve ${contactConfig.professionalName}`);

    // Verifica il servizio selezionato
    expect(message).toContain("Valutazione completa dei rischi aziendali");

    // Verifica il percorso completo
    expect(message).toContain(
      "Aziende → Sicurezza sul lavoro → Valutazione dei rischi → Valutazione completa dei rischi aziendali",
    );
  });
});
