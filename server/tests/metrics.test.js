import { describe, test, expect } from "vitest";
import { percentChange, getVerdict } from "../utils/metrics.js";

describe("percentChange", () => {
  test.each([
    [32, 9, -72],
    [10, 10, 0],
    [4, 6, 50],
    [56, 40, -29],
  ])("%i → %i is %i%", (before, after, expected) => {
    expect(percentChange(before, after)).toBe(expected);
  });

  test("returns null when there's no baseline", () => {
    expect(percentChange(0, 5)).toBeNull();
  });
});

describe("getVerdict", () => {
  test("the Printer Guide demo fix worked", () => {
    expect(
      getVerdict({ daysObserved: 30, ticketsBefore: 32, changePercent: -72 }),
    ).toBe("worked");
  });

  test("a fix less than 7 days old is too early to judge", () => {
    expect(
      getVerdict({ daysObserved: 6, ticketsBefore: 32, changePercent: -90 }),
    ).toBe("too_early");
  });

  test("a tiny baseline is not enough data, even with a big drop", () => {
    expect(
      getVerdict({ daysObserved: 30, ticketsBefore: 2, changePercent: -50 }),
    ).toBe("not_enough_data");
  });

  test("no baseline at all is not enough data", () => {
    expect(
      getVerdict({ daysObserved: 30, ticketsBefore: 0, changePercent: null }),
    ).toBe("not_enough_data");
  });

  test.each([
    [-25, "worked"],
    [-24, "partial"],
    [-1, "partial"],
    [0, "no_improvement"],
    [40, "no_improvement"],
  ])("a %i% change is %s", (changePercent, expected) => {
    expect(
      getVerdict({ daysObserved: 30, ticketsBefore: 20, changePercent }),
    ).toBe(expected);
  });
});
