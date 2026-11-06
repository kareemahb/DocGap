import SupportIssue from "../models/SupportIssue.js";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SCORE_WINDOW_DAYS = 90;

/**
 * Counts ticket occurrences per document inside a date window.
 * Returns a Map: documentId (string) → count
 */
export const countTicketsByDocument = async ({
  documentIds,
  from,
  to = new Date(),
}) => {
  const match = { relatedDocument: { $ne: null } };
  if (documentIds) match.relatedDocument = { $in: documentIds };

  const rows = await SupportIssue.aggregate([
    { $match: match },
    { $unwind: "$occurrences" },
    { $match: { occurrences: { $gte: from, $lt: to } } },
    { $group: { _id: "$relatedDocument", count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
};

/** Ticket counts for the Debt Score window (last 90 days) */
export const recentTicketCounts = (documentIds, days = SCORE_WINDOW_DAYS) =>
  countTicketsByDocument({
    documentIds,
    from: new Date(Date.now() - days * DAY_MS),
  });

/** Total ticket occurrences across ALL documents inside a window */
export const countTicketsInWindow = async (from, to = new Date()) => {
  const [row] = await SupportIssue.aggregate([
    { $unwind: "$occurrences" },
    { $match: { occurrences: { $gte: from, $lt: to } } },
    { $count: "total" },
  ]);
  return row?.total ?? 0;
};
