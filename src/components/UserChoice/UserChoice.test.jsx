// @vitest-environment jsdom
import { aziendaOptions, privatoOptions } from "../../data/serviceOptions.js";

import { serviceDestinations } from "../../data/serviceDestinations.js";
import { render, screen, cleanup } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { test, expect, afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

import UserChoice from "./UserChoice";

afterEach(() => {
  cleanup();
});

test("mostra la scelta iniziale tra azienda e privato", () => {
  render(<UserChoice />);

  const title = screen.getByText("Qual è la tua situazione?");

  expect(title).toBeInTheDocument();
});

test("cliccando su azienda mostra le opzioni per l'azienda", async () => {
  const user = userEvent.setup();

  render(<UserChoice />);

  const aziendaButton = screen.getByRole("button", {
    name: /sono un'azienda/i,
  });

  await user.click(aziendaButton);

  const title = screen.getByText("Di cosa hai bisogno?");

  expect(title).toBeInTheDocument();
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

  expect(screen.getByText("Come può aiutarti Fulvio")).toBeInTheDocument();

  expect(
    screen.getByRole("link", {
      name: /parla con fulvio su whatsapp/i,
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
      name: /parla con fulvio su whatsapp/i,
    }),
  ).toBeInTheDocument();
});
test("crea correttamente il link whatsapp con il percorso selezionato", async () => {
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
    name: /parla con fulvio su whatsapp/i,
  });

  expect(whatsappLink).toHaveAttribute(
    "href",
    expect.stringContaining("393421284498"),
  );

  expect(whatsappLink).toHaveAttribute(
    "href",
    expect.stringContaining("Percorso%20dal%20sito"),
  );
});
test("ogni esigenza del wizard ha una destinazione finale", () => {
  const allOptions = [...aziendaOptions, ...privatoOptions];

  const allNeeds = allOptions.flatMap((service) => service.options);

  allNeeds.forEach((need) => {
    expect(serviceDestinations[need.id]).toBeDefined();
  });
});
