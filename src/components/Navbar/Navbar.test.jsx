// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { describe, expect, test, afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

import Navbar from "./Navbar.jsx";

afterEach(() => {
  cleanup();
});

const renderNavbar = (initialRoute = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>,
  );
};

describe("Navbar", () => {
  test("mostra il logo e il nome di Fulvio Martello", () => {
    renderNavbar();

    expect(screen.getByAltText("Fulvio Martello")).toBeInTheDocument();

    expect(screen.getByText("FULVIO MARTELLO")).toBeInTheDocument();

    expect(screen.getByText("Consulente del Lavoro")).toBeInTheDocument();
  });

  test("mostra tutte le voci della navigazione desktop", () => {
    renderNavbar();

    expect(
      screen.getAllByRole("link", { name: "Home" }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", { name: "Servizi" }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", {
        name: "Sicurezza sul lavoro",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", {
        name: "Formazione",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", {
        name: "Servizi per privati",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", {
        name: "Chi sono",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByRole("link", {
        name: "Contatti",
      }).length,
    ).toBeGreaterThan(0);
  });

  test("i link principali puntano alle route corrette", () => {
    renderNavbar();

    const servicesLinks = screen.getAllByRole("link", {
      name: "Servizi",
    });

    const safetyLinks = screen.getAllByRole("link", {
      name: "Sicurezza sul lavoro",
    });

    const formationLinks = screen.getAllByRole("link", {
      name: "Formazione",
    });

    const privateLinks = screen.getAllByRole("link", {
      name: "Servizi per privati",
    });

    expect(servicesLinks[0]).toHaveAttribute("href", "/servizi");

    expect(safetyLinks[0]).toHaveAttribute("href", "/sicurezza-sul-lavoro");

    expect(formationLinks[0]).toHaveAttribute("href", "/formazione");

    expect(privateLinks[0]).toHaveAttribute("href", "/privati");
  });

  test("il menu mobile è chiuso inizialmente", () => {
    renderNavbar();

    const menuButton = screen.getByRole("button", {
      name: "Apri menu",
    });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("apre il menu mobile premendo il pulsante hamburger", async () => {
    const user = userEvent.setup();

    renderNavbar();

    const menuButton = screen.getByRole("button", {
      name: "Apri menu",
    });

    await user.click(menuButton);

    expect(
      screen.getByRole("button", {
        name: "Chiudi menu",
      }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("chiude il menu mobile premendo nuovamente il pulsante", async () => {
    const user = userEvent.setup();

    renderNavbar();

    await user.click(
      screen.getByRole("button", {
        name: "Apri menu",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Chiudi menu",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Apri menu",
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("evidenzia Formazione quando la route corrente è /formazione", () => {
    renderNavbar("/formazione");

    const formationLinks = screen.getAllByRole("link", {
      name: "Formazione",
    });

    const activeFormationLink = formationLinks.find((link) =>
      link.classList.contains("navbar__link--active"),
    );

    expect(activeFormationLink).toBeDefined();
  });

  test("evidenzia Sicurezza sul lavoro nella relativa pagina", () => {
    renderNavbar("/sicurezza-sul-lavoro");

    const safetyLinks = screen.getAllByRole("link", {
      name: "Sicurezza sul lavoro",
    });

    const activeSafetyLink = safetyLinks.find((link) =>
      link.classList.contains("navbar__link--active"),
    );

    expect(activeSafetyLink).toBeDefined();
  });

  test("Home non rimane attiva quando siamo su Formazione", () => {
    renderNavbar("/formazione");

    const homeLinks = screen.getAllByRole("link", {
      name: "Home",
    });

    const activeHomeLink = homeLinks.find((link) =>
      link.classList.contains("navbar__link--active"),
    );

    expect(activeHomeLink).toBeUndefined();
  });
});
