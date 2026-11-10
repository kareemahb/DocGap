import { describe, test, expect } from "vitest";
import {
  calculateDebtScore,
  getSeverity,
  WEIGHTS,
} from "../utils/debtScore.js";

// A fixed "today" so results never change as real time passes
const NOW = new Date("2026-11-06T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const daysBefore = (days) => new Date(NOW.getTime() - days * DAY_MS);

describe("calculateDebtScore", () => {
  test("MFA Reset Procedure scores 88 and is critical", () => {
    const mfa = {
      lastReviewedAt: daysBefore(245),
      negativeFeedback: 14,
      missingInfo: true,
      businessImpact: "critical",
    };

    const result = calculateDebtScore(mfa, 32, NOW);

    expect(result.score).toBe(88);
    expect(result.severity).toBe("critical");
    expect(result.breakdown).toEqual({
      tickets: 24,
      age: 18.1,
      feedback: 10.5,
      missingInfo: 15,
      impact: 20,
    });
    expect(result.reasons).toEqual([
      "32 related support tickets (last 90 days)",
      "Last reviewed 8 months ago",
      "14 negative feedback reports",
      "Flagged as missing information",
      "Critical business impact",
    ]);
  });

  test.each([
    [
      "VPN Setup for Contractors",
      {
        lastReviewedAt: daysBefore(330),
        negativeFeedback: 9,
        missingInfo: true,
        businessImpact: "high",
      },
      21,
      72,
      "high",
    ],
    [
      "Refund Escalation SOP",
      {
        lastReviewedAt: daysBefore(120),
        negativeFeedback: 11,
        businessImpact: "high",
      },
      14,
      42,
      "medium",
    ],
    [
      "Printer Driver Install Guide",
      {
        lastReviewedAt: daysBefore(30),
        negativeFeedback: 1,
        businessImpact: "low",
      },
      41,
      33,
      "healthy",
    ],
    [
      "New Hire Laptop Runbook",
      {
        lastReviewedAt: daysBefore(60),
        negativeFeedback: 4,
        businessImpact: "medium",
      },
      6,
      19,
      "healthy",
    ],
    [
      "Password Policy",
      {
        lastReviewedAt: daysBefore(21),
        negativeFeedback: 0,
        businessImpact: "medium",
      },
      1,
      9,
      "healthy",
    ],
  ])(
    "%s scores %i (seed data)",
    (_title, doc, tickets, expectedScore, expectedSeverity) => {
      const { score, severity } = calculateDebtScore(doc, tickets, NOW);
      expect(score).toBe(expectedScore);
      expect(severity).toBe(expectedSeverity);
    },
  );

  test("Reset your password scores 92 and is critical", () => {
    const resetPassword = {
      lastReviewedAt: daysBefore(420),
      negativeFeedback: 9,
      missingInfo: true,
      businessImpact: "critical",
    };

    const result = calculateDebtScore(resetPassword, 42, NOW);

    expect(result.score).toBe(92);
    expect(result.severity).toBe("critical");
  });

  test("a doc that was never reviewed gets full review-age points", () => {
    const planned = { lastReviewedAt: null, businessImpact: "low" };

    const result = calculateDebtScore(planned, 0, NOW);

    expect(result.breakdown.age).toBe(WEIGHTS.age);
    expect(result.reasons).toEqual(["No linked doc yet"]);
  });

  test("a brand-new, low-impact doc with no tickets scores 0", () => {
    const result = calculateDebtScore(
      { lastReviewedAt: NOW, businessImpact: "low" },
      0,
      NOW,
    );

    expect(result.score).toBe(0);
    expect(result.severity).toBe("healthy");
    expect(result.reasons).toEqual([]);
  });

  test("everything maxed out caps at exactly 100", () => {
    const worst = {
      lastReviewedAt: daysBefore(900),
      negativeFeedback: 99,
      missingInfo: true,
      businessImpact: "critical",
    };

    expect(calculateDebtScore(worst, 500, NOW).score).toBe(100);
  });

  test("tickets stop adding points after the cap", () => {
    const doc = { lastReviewedAt: NOW, businessImpact: "low" };

    const atCap = calculateDebtScore(doc, 40, NOW).breakdown.tickets;
    const wayOver = calculateDebtScore(doc, 500, NOW).breakdown.tickets;

    expect(atCap).toBe(WEIGHTS.tickets);
    expect(wayOver).toBe(WEIGHTS.tickets);
  });

  test("negative feedback below zero is treated as zero", () => {
    const doc = {
      lastReviewedAt: NOW,
      negativeFeedback: -5,
      businessImpact: "low",
    };
    expect(calculateDebtScore(doc, 0, NOW).breakdown.feedback).toBe(0);
  });

  test("missing business impact falls back to medium", () => {
    const doc = { lastReviewedAt: NOW };
    expect(calculateDebtScore(doc, 0, NOW).breakdown.impact).toBe(7);
  });

  test("review age only becomes a reason after about 3 months", () => {
    const recent = calculateDebtScore(
      { lastReviewedAt: daysBefore(60), businessImpact: "low" },
      0,
      NOW,
    );
    const stale = calculateDebtScore(
      { lastReviewedAt: daysBefore(100), businessImpact: "low" },
      0,
      NOW,
    );

    expect(recent.reasons).toEqual([]);
    expect(stale.reasons).toEqual(["Last reviewed 3 months ago"]);
  });
});

describe("getSeverity", () => {
  test.each([
    [100, "critical"],
    [80, "critical"],
    [79, "high"],
    [60, "high"],
    [59, "medium"],
    [40, "medium"],
    [39, "healthy"],
    [0, "healthy"],
  ])("a score of %i is %s", (score, expected) => {
    expect(getSeverity(score)).toBe(expected);
  });
});
