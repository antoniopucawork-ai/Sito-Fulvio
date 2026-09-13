// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import { test, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import Hero from "./Hero";

afterEach(() => {
  cleanup();
});

test("mostra il contenuto principale della hero", () => {
  render(<Hero />);

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
  render(<Hero />);

  const guidedLink = screen.getByRole("link", {
    name: /trova ciò che ti serve/i,
  });

  expect(guidedLink).toHaveAttribute("href", "#user-choice");
});

test("vedi tutti i servizi porta alla pagina servizi", () => {
  render(<Hero />);

  const servicesLink = screen.getByRole("link", {
    name: /vedi tutti i servizi/i,
  });

  expect(servicesLink).toHaveAttribute("href", "/servizi");
});
