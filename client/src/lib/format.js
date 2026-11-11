// Small display helpers for dates and percentages

const DAY_MS = 24 * 60 * 60 * 1000;

export const daysSince = (date, now = new Date()) =>
  Math.floor((now - new Date(date)) / DAY_MS);

// "14 mo ago", "3 wk ago", "5d ago", or "—" for never reviewed
export const formatReviewAge = (date) => {
  if (!date) return "—";
  const days = daysSince(date);
  if (days < 1) return "today";
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)} wk ago`;
  return `${Math.round(days / 30)} mo ago`;
};

// "today", "1 day ago", "14 days ago"
export const formatDaysAgo = (date) => {
  const days = daysSince(date);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

// −63%, +12%, 0% (with a real minus sign), or "—" when there's no number
export const formatPercent = (value) => {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value)}%`;
};
