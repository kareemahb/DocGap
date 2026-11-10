import { describe, test, expect } from "vitest";
import {
  percentChange,
  getVerdict,
  countDriverDocs,
  getHealthStatus,
} from "../utils/metrics.js";

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

describe("countDriverDocs", () => {
  test("4 docs drive most of the demo week's 38 tickets", () => {
    expect(countDriverDocs([2, 7, 3, 5, 6, 4], 38)).toBe(4);
  });

  test("one doc with every ticket is the only driver", () => {
    expect(countDriverDocs([10], 10)).toBe(1);
  });

  test("no tickets means no drivers", () => {
    expect(countDriverDocs([], 0)).toBe(0);
  });

  test("when most tickets aren't linked to a doc, every doc counts", () => {
    expect(countDriverDocs([2, 1], 20)).toBe(2);
  });
});

describe("getHealthStatus", () => {
  test.each([
    [100, "healthy"],
    [86, "healthy"],
    [80, "healthy"],
    [79, "needs_review"],
    [59, "needs_review"],
    [50, "needs_review"],
    [49, "at_risk"],
    [32, "at_risk"],
  ])("%i% reviewed is %s", (percent, expected) => {
    expect(getHealthStatus(percent)).toBe(expected);
  });
});
