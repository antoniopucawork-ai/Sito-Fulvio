import { describe, expect, test } from "vitest";
import {
  getTimeInterval,
  intervalsOverlap,
  timeToMicroseconds,
} from "../../netlify/functions/_lib/bookingTime.mjs";
import { malformedDatabaseTimes } from "./fixtures/timePrecisionCases.mjs";

describe("parser orari a precisione di microsecondo", () => {
  test.each([
    ["00:00", 0],
    ["00:00:00.000001", 1],
    ["09:00", 32_400_000_000],
    ["09:00:30", 32_430_000_000],
    ["09:00:00.1", 32_400_100_000],
    ["09:00:00.123456", 32_400_123_456],
    ["09:00:00.000001", 32_400_000_001],
    ["23:59:59.999999", 86_399_999_999],
  ])("%s = %i microsecondi dalla mezzanotte", (time, expected) => {
    const actual = timeToMicroseconds(time);
    expect(actual).toBe(expected);
    expect(Number.isSafeInteger(actual)).toBe(true);
  });

  test.each([...malformedDatabaseTimes, "24:00", "09:60", "09:00.5", "", null, 900, ["09:00"], { toString: null }])(
    "rifiuta %j senza coercizioni o eccezioni", (time) => {
      expect(timeToMicroseconds(time)).toBeNaN();
    },
  );
});

describe("intervalli esatti", () => {
  test("conserva i 30 secondi fino alla fine dell'appuntamento", () => {
    expect(getTimeInterval(32_430_000_000, 60)).toEqual({
      start: 32_430_000_000, end: 36_030_000_000,
    });
  });
  test("aggiunge 90 minuti prima e dopo senza troncare il microsecondo", () => {
    expect(getTimeInterval(32_400_000_001, 60, 90)).toEqual({
      start: 27_000_000_001, end: 41_400_000_001,
    });
  });
  test.each([
    [{ start: 0, end: 10 }, { start: 10, end: 20 }, false],
    [{ start: 0, end: 11 }, { start: 10, end: 20 }, true],
    [{ start: 0, end: 9 }, { start: 10, end: 20 }, false],
    [{ start: 0, end: 20 }, { start: 5, end: 10 }, true],
  ])("confronto [inizio, fine) %j con %j", (first, second, expected) => {
    expect(intervalsOverlap(first, second)).toBe(expected);
    expect(intervalsOverlap(second, first)).toBe(expected);
  });
});
