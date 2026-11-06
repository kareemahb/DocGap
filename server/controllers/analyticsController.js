import Document from "../models/Document.js";
import KnowledgeGap from "../models/KnowledgeGap.js";
import { calculateDebtScore } from "../utils/debtScore.js";
import {
  percentChange,
  getVerdict,
  MIN_DAYS_OBSERVED,
} from "../utils/metrics.js";
import {
  recentTicketCounts,
  countTicketsByDocument,
  countTicketsInWindow,
  DAY_MS,
} from "../services/ticketStats.js";

const OVERDUE_REVIEW_DAYS = 90;
const OPEN_STATUSES = ["open", "in_review", "in_progress"];

// GET /api/analytics/overview: everything the dashboard's top section needs
export const getOverview = async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * DAY_MS);
  const sixtyDaysAgo = new Date(now - 60 * DAY_MS);
  const overdueCutoff = new Date(now - OVERDUE_REVIEW_DAYS * DAY_MS);

  // 1. Score every active document
  const docs = await Document.find({ status: "active" });
  const counts = await recentTicketCounts(docs.map((doc) => doc._id));

  const scored = docs.map((doc) => ({
    id: doc._id,
    title: doc.title,
    ...calculateDebtScore(doc, counts.get(doc._id.toString()) ?? 0, now),
  }));

  const severityCounts = { critical: 0, high: 0, medium: 0, healthy: 0 };
  for (const { severity } of scored) severityCounts[severity] += 1;

  const averageDebt = scored.length
    ? scored.reduce((sum, { score }) => sum + score, 0) / scored.length
    : 0;

  const topDocument = scored.reduce(
    (top, doc) => (!top || doc.score > top.score ? doc : top),
    null,
  );

  // 2. Everything else at the same time
  const [
    ticketsLast30,
    ticketsPrevious30,
    openGaps,
    unassignedGaps,
    resolvedLast30,
  ] = await Promise.all([
    countTicketsInWindow(thirtyDaysAgo, now),
    countTicketsInWindow(sixtyDaysAgo, thirtyDaysAgo),
    KnowledgeGap.countDocuments({ status: { $in: OPEN_STATUSES } }),
    KnowledgeGap.countDocuments({
      status: { $in: OPEN_STATUSES },
      $or: [{ assignee: { $exists: false } }, { assignee: "" }],
    }),
    KnowledgeGap.countDocuments({
      status: "resolved",
      resolvedAt: { $gte: thirtyDaysAgo },
    }),
  ]);

  const overdueReviews = docs.filter(
    (doc) => doc.lastReviewedAt < overdueCutoff,
  ).length;

  res.json({
    knowledgeHealth: Math.round(100 - averageDebt),
    totalDocuments: docs.length,
    severityCounts,
    topDocument: topDocument && {
      id: topDocument.id,
      title: topDocument.title,
      score: topDocument.score,
      severity: topDocument.severity,
    },
    overdueReviews,
    gaps: {
      open: openGaps,
      unassigned: unassignedGaps,
      resolvedLast30,
    },
    tickets: {
      last30: ticketsLast30,
      previous30: ticketsPrevious30,
      changePercent: percentChange(ticketsPrevious30, ticketsLast30),
    },
    generatedAt: now,
  });
};

// Compares tickets before vs after a gap's resolvedAt using equal-length windows
const measureFixImpact = async (gap, maxDays, now = new Date()) => {
  const fixDate = gap.resolvedAt;
  const afterEnd = new Date(
    Math.min(now.getTime(), fixDate.getTime() + maxDays * DAY_MS),
  );
  const windowMs = afterEnd - fixDate;
  const beforeStart = new Date(fixDate.getTime() - windowMs);
  const documentId = gap.document._id;

  const [beforeCounts, afterCounts] = await Promise.all([
    countTicketsByDocument({
      documentIds: [documentId],
      from: beforeStart,
      to: fixDate,
    }),
    countTicketsByDocument({
      documentIds: [documentId],
      from: fixDate,
      to: afterEnd,
    }),
  ]);

  const ticketsBefore = beforeCounts.get(documentId.toString()) ?? 0;
  const ticketsAfter = afterCounts.get(documentId.toString()) ?? 0;
  const changePercent = percentChange(ticketsBefore, ticketsAfter);
  const daysObserved = Math.floor(windowMs / DAY_MS);

  return {
    gapId: gap._id,
    gapTitle: gap.title,
    document: { id: documentId, title: gap.document.title },
    resolvedAt: fixDate,
    daysObserved,
    windows: {
      before: { from: beforeStart, to: fixDate },
      after: { from: fixDate, to: afterEnd },
    },
    ticketsBefore,
    ticketsAfter,
    changePercent,
    verdict: getVerdict({ daysObserved, ticketsBefore, changePercent }),
  };
};

// Reads ?days=, defaulting to 30 and allowing 7–180
const parseDays = (value) => {
  if (value === undefined) return 30;
  const days = Number(value);
  if (!Number.isInteger(days) || days < MIN_DAYS_OBSERVED || days > 180) {
    const error = new Error("days must be a whole number from 7 to 180");
    error.status = 400;
    throw error;
  }
  return days;
};

// GET /api/analytics/fix-impact/:gapId?days=30
export const getFixImpact = async (req, res) => {
  const days = parseDays(req.query.days);

  const gap = await KnowledgeGap.findById(req.params.gapId).populate(
    "document",
    "title",
  );
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  if (!gap.resolvedAt) {
    return res.status(400).json({
      message: "This gap isn't resolved yet, so there's no fix to measure",
    });
  }
  if (!gap.document) {
    return res
      .status(400)
      .json({ message: "This gap has no linked document to measure" });
  }

  res.json(await measureFixImpact(gap, days));
};

// GET /api/analytics/fixes?days=30: every resolved gap, newest fix first
export const getFixes = async (req, res) => {
  const days = parseDays(req.query.days);
  const now = new Date();

  const gaps = await KnowledgeGap.find({
    resolvedAt: { $exists: true },
    document: { $exists: true },
  })
    .populate("document", "title")
    .sort({ resolvedAt: -1 });

  const measurable = gaps.filter((gap) => gap.document);
  const results = await Promise.all(
    measurable.map((gap) => measureFixImpact(gap, days, now)),
  );

  res.json(results);
};
