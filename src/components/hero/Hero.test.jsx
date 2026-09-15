// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { test, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import Hero from "./Hero";

afterEach(() => {
  cleanup();
});

const renderHero = () => {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  );
};

test("mostra il contenuto principale della hero", () => {
  renderHero();

  expect(
    screen.getByRole("heading", {
      name: /soluzioni professionali/i,
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("link", {
      name: /trova ciò che ti serve/i,
    }),
  ).toBeInTheDocument();
});

test("trova ciò che ti serve porta al percorso guidato", () => {
  renderHero();

  const guidedLink = screen.getByRole("link", {
    name: /trova ciò che ti serve/i,
  });

  expect(guidedLink).toHaveAttribute("href", "#user-choice");
});

test("vedi tutti i servizi porta alla pagina servizi", () => {
  renderHero();

  const servicesLink = screen.getByRole("link", {
    name: /vedi tutti i servizi/i,
  });

  expect(servicesLink).toHaveAttribute("href", "/servizi");
});

test("mostra le tre aree principali nella versione desktop", () => {
  renderHero();

  expect(
    screen.getByRole("heading", {
      name: "Lavoro",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Sicurezza",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: "Formazione",
    }),
  ).toBeInTheDocument();
});

test("mostra il collegamento per iniziare il percorso guidato", () => {
  renderHero();

  const guideLink = screen.getByRole("link", {
    name: /non sai da dove iniziare/i,
  });

  expect(guideLink).toHaveAttribute("href", "#user-choice");
});
