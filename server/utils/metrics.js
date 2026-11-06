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
