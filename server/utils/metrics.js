// Shared analytics math: pure functions, no database

export const MIN_DAYS_OBSERVED = 7;
export const MIN_BASELINE_TICKETS = 5;
export const WORKED_THRESHOLD = -25;

// Percent change from `before` to `after`; null when there's no baseline
export const percentChange = (before, after) =>
  before === 0 ? null : Math.round(((after - before) / before) * 100);

// Turns a before/after comparison into a plain-language verdict
export const getVerdict = ({ daysObserved, ticketsBefore, changePercent }) => {
  if (daysObserved < MIN_DAYS_OBSERVED) return "too_early";
  if (ticketsBefore < MIN_BASELINE_TICKETS) return "not_enough_data";
  if (changePercent <= WORKED_THRESHOLD) return "worked";
  if (changePercent < 0) return "partial";
  return "no_improvement";
};

// The fewest documents whose tickets add up to at least half of all tickets
export const countDriverDocs = (ticketCountsPerDoc, totalTickets) => {
  if (totalTickets === 0) return 0;
  const sorted = [...ticketCountsPerDoc].sort((a, b) => b - a);
  let covered = 0;
  for (const [i, count] of sorted.entries()) {
    covered += count;
    if (covered * 2 >= totalTickets) return i + 1;
  }
  return sorted.length;
};

// Share of a knowledge base reviewed recently → a status label
export const getHealthStatus = (percentReviewed) => {
  if (percentReviewed >= 80) return "healthy";
  if (percentReviewed >= 50) return "needs_review";
  return "at_risk";
};
