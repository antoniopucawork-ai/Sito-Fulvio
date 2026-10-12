// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import SafetyPage from "./SafetyPage.jsx";
import { contactConfig } from "../data/contactConfig.js";

afterEach(() => {
  cleanup();
});

const renderSafetyPage = () => {
  return render(
    <MemoryRouter>
      <SafetyPage />
    </MemoryRouter>,
  );
};

describe("SafetyPage", () => {
  test("mostra il titolo principale della pagina sicurezza", () => {
    renderSafetyPage();

    const mainTitle = screen.getByRole("heading", {
      level: 1,
    });

    expect(mainTitle).toBeInTheDocument();

    expect(mainTitle).toHaveTextContent(
      /la sicurezza della tua azienda,\s*spiegata in modo semplice/i,
    );
  });

  test("mostra le sei aree principali della sicurezza", () => {
    renderSafetyPage();

    expect(
      screen.getByRole("heading", {
        name: /gestire la sicurezza della tua azienda/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /valutare i rischi/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /cantieri ed edilizia/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /settore chimico e petrolchimico/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /organizzare la prevenzione/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /infortuni e ispezioni/i,
      }),
    ).toBeInTheDocument();
  });

  test("mostra i principali servizi di valutazione dei rischi", () => {
    renderSafetyPage();

    expect(
      screen.getByText("Documento di Valutazione dei Rischi (DVR)"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Valutazione completa dei rischi aziendali"),
    ).toBeInTheDocument();

    expect(screen.getByText("Rischio incendio e C.P.I.")).toBeInTheDocument();

    expect(screen.getAllByText("Rischio ATEX").length).toBeGreaterThan(0);

    expect(screen.getByText("DUVRI")).toBeInTheDocument();
  });

  test("mostra i servizi dedicati ai cantieri", () => {
    renderSafetyPage();

    expect(screen.getByText("PSC")).toBeInTheDocument();

    expect(screen.getByText("POS")).toBeInTheDocument();

    expect(
      screen.getByText("Fascicolo tecnico dell'opera"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Coordinamento della sicurezza"),
    ).toBeInTheDocument();

    expect(screen.getByText("Notifiche preliminari")).toBeInTheDocument();
  });

  test("mostra i servizi per il settore chimico e petrolchimico", () => {
    renderSafetyPage();

    expect(screen.getByText("Seveso III")).toBeInTheDocument();

    expect(screen.getByText("Piani di emergenza interna")).toBeInTheDocument();

    expect(
      screen.getByText("Permessi di lavoro ad alto rischio"),
    ).toBeInTheDocument();

    expect(screen.getByText("Schede di sicurezza SDS")).toBeInTheDocument();

    expect(screen.getByText("Etichettatura CLP")).toBeInTheDocument();
  });

  test("mostra il pulsante WhatsApp finale", () => {
    renderSafetyPage();

    const whatsappLink = screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    });

    expect(whatsappLink).toBeInTheDocument();

    expect(whatsappLink).toHaveAttribute("target", "_blank");

    expect(whatsappLink).toHaveAttribute("rel", "noreferrer");
  });

  test("il link WhatsApp contiene il messaggio dedicato alla sicurezza", () => {
    renderSafetyPage();

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

    // Verifica che la richiesta riguardi la sicurezza
    expect(message).toContain(
      "Avrei bisogno di informazioni sui servizi di sicurezza sul lavoro",
    );
  });
});
