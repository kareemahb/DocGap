import Document from "../models/Document.js";
import KnowledgeBase from "../models/KnowledgeBase.js";
import KnowledgeGap from "../models/KnowledgeGap.js";
import SupportIssue from "../models/SupportIssue.js";
import { calculateDebtScore } from "../utils/debtScore.js";
import {
  percentChange,
  getVerdict,
  countDriverDocs,
  getHealthStatus,
  MIN_DAYS_OBSERVED,
} from "../utils/metrics.js";
import {
  recentTicketCounts,
  countTicketsByDocument,
  countTicketsInWindow,
  dailyTicketCounts,
  DAY_MS,
} from "../services/ticketStats.js";

const HIGH_DEBT_SCORE = 60;
const OVERDUE_REVIEW_DAYS = 90;
const REVIEW_WINDOW_DAYS = 90;
const OPEN_STATUSES = ["open", "in_review", "in_progress"];

const daysBefore = (date, days) => new Date(date.getTime() - days * DAY_MS);
const round1 = (value) => Math.round(value * 10) / 10;

// Reads ?days=, using `fallback` when missing and allowing 7–180
const parseDays = (value, fallback = 30) => {
  if (value === undefined) return fallback;
  const days = Number(value);
  if (!Number.isInteger(days) || days < MIN_DAYS_OBSERVED || days > 180) {
    const error = new Error("days must be a whole number from 7 to 180");
    error.status = 400;
    throw error;
  }
  return days;
};

// ─── Overview: the summary cards at the top of the dashboard ──────

// GET /api/analytics/overview
export const getOverview = async (req, res) => {
  const now = new Date();
  const weekAgo = daysBefore(now, 7);

  // 1. Score every active document
  const docs = await Document.find({ status: "active" });
  const docIds = docs.map((doc) => doc._id);

  const [counts, weekCounts] = await Promise.all([
    recentTicketCounts(docIds),
    countTicketsByDocument({ documentIds: docIds, from: weekAgo, to: now }),
  ]);

  const scored = docs.map((doc) => ({
    id: doc._id,
    title: doc.title,
    lastReviewedAt: doc.lastReviewedAt,
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

  // High-debt docs and how long the oldest one has gone without review
  const highDebtDocs = scored.filter((doc) => doc.score >= HIGH_DEBT_SCORE);
  const reviewedHighDebt = highDebtDocs.filter((doc) => doc.lastReviewedAt);
  const oldestReviewDays = reviewedHighDebt.length
    ? Math.floor(
        Math.max(
          ...reviewedHighDebt.map((doc) => (now - doc.lastReviewedAt) / DAY_MS),
        ),
      )
    : null;

  // 2. Everything else at the same time
  const [
    ticketsThisWeek,
    ticketsLastWeek,
    ticketsLast30,
    ticketsPrevious30,
    unlinkedIssues,
    openGaps,
    unassignedGaps,
    resolvedLast30,
    fixesToVerify,
  ] = await Promise.all([
    countTicketsInWindow(weekAgo, now),
    countTicketsInWindow(daysBefore(now, 14), weekAgo),
    countTicketsInWindow(daysBefore(now, 30), now),
    countTicketsInWindow(daysBefore(now, 60), daysBefore(now, 30)),
    SupportIssue.countDocuments({
      relatedDocument: null,
      status: { $ne: "closed" },
    }),
    KnowledgeGap.countDocuments({ status: { $in: OPEN_STATUSES } }),
    KnowledgeGap.countDocuments({
      status: { $in: OPEN_STATUSES },
      $or: [{ assignee: { $exists: false } }, { assignee: "" }],
    }),
    KnowledgeGap.countDocuments({
      status: "resolved",
      resolvedAt: { $gte: daysBefore(now, 30) },
    }),
    KnowledgeGap.find({ status: "resolved", verifiedAt: null }).select(
      "resolvedAt",
    ),
  ]);

  const readyCutoff = daysBefore(now, MIN_DAYS_OBSERVED);
  const overdueCutoff = daysBefore(now, OVERDUE_REVIEW_DAYS);

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
    highDebt: {
      count: highDebtDocs.length,
      oldestReviewDays,
    },
    unlinkedIssues,
    driverDocs: countDriverDocs([...weekCounts.values()], ticketsThisWeek),
    fixesToVerify: {
      count: fixesToVerify.length,
      ready: fixesToVerify.filter((gap) => gap.resolvedAt <= readyCutoff)
        .length,
    },
    overdueReviews: docs.filter(
      (doc) => !doc.lastReviewedAt || doc.lastReviewedAt < overdueCutoff,
    ).length,
    gaps: {
      open: openGaps,
      unassigned: unassignedGaps,
      resolvedLast30,
    },
    ticketsThisWeek: {
      count: ticketsThisWeek,
      lastWeek: ticketsLastWeek,
      changePercent: percentChange(ticketsLastWeek, ticketsThisWeek),
    },
    tickets: {
      last30: ticketsLast30,
      previous30: ticketsPrevious30,
      changePercent: percentChange(ticketsPrevious30, ticketsLast30),
    },
    generatedAt: now,
  });
};

// ─── Knowledge base health ────────────────────────────────────────

// GET /api/analytics/knowledge-bases
export const getKnowledgeBaseHealth = async (req, res) => {
  const now = new Date();
  const cutoff = daysBefore(now, REVIEW_WINDOW_DAYS);

  const [knowledgeBases, rows] = await Promise.all([
    KnowledgeBase.find().sort({ name: 1 }),
    Document.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$knowledgeBase",
          total: { $sum: 1 },
          reviewed: {
            $sum: { $cond: [{ $gte: ["$lastReviewedAt", cutoff] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const statsByKnowledgeBase = new Map(
    rows.map((row) => [String(row._id), row]),
  );

  const results = knowledgeBases
    .map((kb) => {
      const { total = 0, reviewed = 0 } =
        statsByKnowledgeBase.get(kb._id.toString()) ?? {};
      const percent = total ? Math.round((reviewed / total) * 100) : 0;
      return {
        id: kb._id,
        name: kb.name,
        color: kb.color,
        totalDocuments: total,
        reviewedRecently: reviewed,
        percent,
        status: total ? getHealthStatus(percent) : "empty",
      };
    })
    .sort((a, b) => b.percent - a.percent);

  res.json({ windowDays: REVIEW_WINDOW_DAYS, knowledgeBases: results });
};

// ─── Ticket trend: the bar chart at the bottom of the dashboard ───

// GET /api/analytics/tickets-trend?days=14
export const getTicketTrend = async (req, res) => {
  const days = parseDays(req.query.days, 14);
  const now = new Date();

  const [daily, fixedGaps] = await Promise.all([
    dailyTicketCounts(days, now),
    KnowledgeGap.find({
      resolvedAt: { $gte: daysBefore(now, days), $lte: now },
    }).select("createdAt resolvedAt"),
  ]);

  const sumBuckets = (from, to) =>
    daily
      .filter((day) => day.daysAgo >= from && day.daysAgo < to)
      .reduce((sum, day) => sum + day.count, 0);

  const thisWeek = sumBuckets(0, 7);
  const lastWeek = days >= 14 ? sumBuckets(7, 14) : null;

  const fixDays = fixedGaps.map(
    (gap) => (gap.resolvedAt - gap.createdAt) / DAY_MS,
  );
  const avgFixDays = fixDays.length
    ? round1(fixDays.reduce((sum, value) => sum + value, 0) / fixDays.length)
    : null;

  res.json({
    days,
    daily,
    thisWeek,
    lastWeek,
    changePercent: lastWeek === null ? null : percentChange(lastWeek, thisWeek),
    docsFixed: fixedGaps.length,
    avgFixDays,
  });
};

// ─── "Did the Fix Work?" ──────────────────────────────────────────

// Loads each gap's document title plus its knowledge base name and color
const FIX_DOCUMENT_POPULATE = {
  path: "document",
  select: "title knowledgeBase",
  populate: { path: "knowledgeBase", select: "name color" },
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
    document: {
      id: documentId,
      title: gap.document.title,
      knowledgeBase: gap.document.knowledgeBase ?? null,
    },
    resolvedAt: fixDate,
    verifiedAt: gap.verifiedAt ?? null,
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

// GET /api/analytics/fix-impact/:gapId?days=30
export const getFixImpact = async (req, res) => {
  const days = parseDays(req.query.days);

  const gap = await KnowledgeGap.findById(req.params.gapId).populate(
    FIX_DOCUMENT_POPULATE,
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

// GET /api/analytics/fixes?days=14&toVerify=true
// Newest fix first. With toVerify, only unverified fixes, ready ones before "too early" ones.
export const getFixes = async (req, res) => {
  const days = parseDays(req.query.days);
  const toVerify = req.query.toVerify === "true";
  const now = new Date();

  const filter = { resolvedAt: { $exists: true }, document: { $exists: true } };
  if (toVerify) {
    filter.status = "resolved";
    filter.verifiedAt = null;
  }

  const gaps = await KnowledgeGap.find(filter)
    .populate(FIX_DOCUMENT_POPULATE)
    .sort({ resolvedAt: -1 });

  const measurable = gaps.filter((gap) => gap.document);
  const results = await Promise.all(
    measurable.map((gap) => measureFixImpact(gap, days, now)),
  );

  if (toVerify) {
    results.sort(
      (a, b) =>
        Number(a.verdict === "too_early") - Number(b.verdict === "too_early"),
    );
  }

  res.json(results);
};

// ─── Root causes: what kind of problem the tickets point to ───────

// GET /api/analytics/root-causes?days=30
export const getRootCauseBreakdown = async (req, res) => {
  const days = parseDays(req.query.days, 30);
  const now = new Date();

  const rootCauses = await SupportIssue.aggregate([
    { $unwind: "$occurrences" },
    { $match: { occurrences: { $gte: daysBefore(now, days), $lt: now } } },
    {
      $group: {
        _id: "$rootCause",
        tickets: { $sum: 1 },
        issueIds: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        rootCause: "$_id",
        tickets: 1,
        issues: { $size: "$issueIds" },
      },
    },
    { $sort: { tickets: -1 } },
  ]);

  const totalTickets = rootCauses.reduce((sum, row) => sum + row.tickets, 0);

  res.json({ days, totalTickets, rootCauses });
};
