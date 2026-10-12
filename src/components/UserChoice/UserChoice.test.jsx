// @vitest-environment jsdom

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import UserChoice from "./UserChoice";
import { aziendaOptions, privatoOptions } from "../../data/serviceOptions.js";
import { serviceDestinations } from "../../data/serviceDestinations.js";
import { contactConfig } from "../../data/contactConfig.js";

afterEach(() => {
  cleanup();
});

test("mostra la scelta iniziale tra azienda e privato", () => {
  render(<UserChoice />);

  expect(screen.getByText("Qual è la tua situazione?")).toBeInTheDocument();
});

test("cliccando su azienda mostra le opzioni per l'azienda", async () => {
  const user = userEvent.setup();

  render(<UserChoice />);

  await user.click(
    screen.getByRole("button", {
      name: /sono un'azienda/i,
    }),
  );

  expect(screen.getByText("Di cosa hai bisogno?")).toBeInTheDocument();
});

test("completa il percorso azienda fino alla destinazione finale", async () => {
  const user = userEvent.setup();

  render(<UserChoice />);

  await user.click(
    screen.getByRole("button", {
      name: /sono un'azienda/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /gestire dipendenti e personale/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /assumere o modificare un contratto/i,
    }),
  );

  expect(
    screen.getByText("Assumere o modificare un contratto"),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: /come può aiutarti il dott\. fulvio martello/i,
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    }),
  ).toBeInTheDocument();
});

test("completa un percorso privato fino alla destinazione finale", async () => {
  const user = userEvent.setup();

  render(<UserChoice />);

  await user.click(
    screen.getByRole("button", {
      name: /sono un privato/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /ho un problema con il mio lavoro/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /assistenza per la naspi/i,
    }),
  );

  expect(
    screen.getByText("Ho bisogno di assistenza per la NASpI"),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("link", {
      name: /contatta il dott\. fulvio martello/i,
    }),
  ).toBeInTheDocument();
});

test("crea correttamente il link WhatsApp con il percorso selezionato", async () => {
  const user = userEvent.setup();

  render(<UserChoice />);

  await user.click(
    screen.getByRole("button", {
      name: /sono un'azienda/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /gestire dipendenti e personale/i,
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: /assumere o modificare un contratto/i,
    }),
  );

  const whatsappLink = screen.getByRole("link", {
    name: /contatta il dott\. fulvio martello/i,
  });

  const href = whatsappLink.getAttribute("href");

  const url = new URL(href);

  expect(url.origin).toBe("https://wa.me");

  expect(url.pathname).toBe(`/${contactConfig.whatsappNumber}`);

  const message = url.searchParams.get("text");

  expect(message).toContain(`Salve ${contactConfig.professionalName}`);

  expect(message).toContain("Percorso dal sito:");

  expect(message).toContain("Azienda");

  expect(message).toContain("Gestire dipendenti e personale");

  expect(message).toContain("Assumere o modificare un contratto");
});

test("ogni esigenza del wizard ha una destinazione finale", () => {
  const allOptions = [...aziendaOptions, ...privatoOptions];

  const allNeeds = allOptions.flatMap((service) => service.options);

  allNeeds.forEach((need) => {
    expect(serviceDestinations[need.id]).toBeDefined();
  });
});
