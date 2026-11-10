export const WEIGHTS = {
  tickets: 30,
  age: 20,
  feedback: 15,
  missingInfo: 15,
  impact: 20,
};

export const CAPS = {
  tickets: 40,
  ageDays: 270,
  feedback: 20,
};

const IMPACT_LEVELS = {
  low: 0,
  medium: 0.35,
  high: 0.7,
  critical: 1,
};

const DAY_MS = 24 * 60 * 60 * 1000;

// How far a value is toward its cap, as 0 to 1
const ratio = (value, cap) => Math.min(Math.max(value, 0) / cap, 1);

const round1 = (value) => Math.round(value * 10) / 10;

export const getSeverity = (score) => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "healthy";
};

export const calculateDebtScore = (
  doc,
  recentTicketCount = 0,
  now = new Date(),
) => {
  const neverReviewed = !doc.lastReviewedAt;
  const daysSinceReview = neverReviewed
    ? CAPS.ageDays
    : Math.floor((now - new Date(doc.lastReviewedAt)) / DAY_MS);

  const monthsSinceReview = Math.round(daysSinceReview / 30);
  const negativeFeedback = doc.negativeFeedback ?? 0;

  const breakdown = {
    tickets: WEIGHTS.tickets * ratio(recentTicketCount, CAPS.tickets),
    age: WEIGHTS.age * ratio(daysSinceReview, CAPS.ageDays),
    feedback: WEIGHTS.feedback * ratio(negativeFeedback, CAPS.feedback),
    missingInfo: doc.missingInfo ? WEIGHTS.missingInfo : 0,
    impact:
      WEIGHTS.impact *
      (IMPACT_LEVELS[doc.businessImpact] ?? IMPACT_LEVELS.medium),
  };

  const score = Math.round(
    Object.values(breakdown).reduce((sum, part) => sum + part, 0),
  );

  // Plain-language "Why the score is high" list for the UI
  const reasons = [];
  if (recentTicketCount > 0)
    reasons.push(`${recentTicketCount} related support tickets (last 90 days)`);
  if (neverReviewed) reasons.push("No linked doc yet");
  else if (monthsSinceReview >= 3)
    reasons.push(`Last reviewed ${monthsSinceReview} months ago`);

  if (negativeFeedback > 0)
    reasons.push(`${negativeFeedback} negative feedback reports`);
  if (doc.missingInfo) reasons.push("Flagged as missing information");
  if (doc.businessImpact === "high" || doc.businessImpact === "critical") {
    reasons.push(
      `${doc.businessImpact[0].toUpperCase()}${doc.businessImpact.slice(1)} business impact`,
    );
  }

  return {
    score,
    severity: getSeverity(score),
    breakdown: Object.fromEntries(
      Object.entries(breakdown).map(([key, value]) => [key, round1(value)]),
    ),
    reasons,
  };
};
