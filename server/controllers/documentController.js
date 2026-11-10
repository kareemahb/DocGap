import Document from "../models/Document.js";
import SupportIssue from "../models/SupportIssue.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { ensureKnowledgeBaseExists } from "../utils/ensureKnowledgeBaseExists.js";
import { calculateDebtScore } from "../utils/debtScore.js";
import { recentTicketCounts } from "../services/ticketStats.js";

const KNOWLEDGE_BASE_FIELDS = "name color";

// Combines a document with its ticket count and debt score
const withDebtScore = (doc, ticketCount) => ({
  ...doc.toObject(),
  recentTicketCount: ticketCount,
  debt: calculateDebtScore(doc, ticketCount),
});

// Oldest review first; never-reviewed docs (null) count as oldest of all
const reviewTime = (doc) =>
  doc.lastReviewedAt ? new Date(doc.lastReviewedAt).getTime() : 0;

// GET /api/documents?knowledgeBase=<id>&owner=rivera&status=active&severity=critical&q=mfa&sort=debt&limit=5
// sort: debt (default) | tickets | review | title | updated
export const getDocuments = async (req, res) => {
  const {
    knowledgeBase,
    owner,
    status = "active",
    severity,
    q,
    sort = "debt",
    limit,
  } = req.query;

  const filter = {};
  if (status !== "all") filter.status = status;
  if (knowledgeBase) filter.knowledgeBase = knowledgeBase;
  if (owner) filter.owner = new RegExp(escapeRegex(owner), "i");
  if (q) filter.$text = { $search: q };

  const docs = await Document.find(filter).populate(
    "knowledgeBase",
    KNOWLEDGE_BASE_FIELDS,
  );
  const counts = await recentTicketCounts(docs.map((doc) => doc._id));

  let results = docs.map((doc) =>
    withDebtScore(doc, counts.get(doc._id.toString()) ?? 0),
  );

  if (severity)
    results = results.filter((doc) => doc.debt.severity === severity);

  // Debt order first, so it also breaks ties for the other sorts
  results.sort((a, b) => b.debt.score - a.debt.score);
  if (sort === "tickets")
    results.sort((a, b) => b.recentTicketCount - a.recentTicketCount);
  if (sort === "review") results.sort((a, b) => reviewTime(a) - reviewTime(b));
  if (sort === "title") results.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "updated") results.sort((a, b) => b.updatedAt - a.updatedAt);

  const max = Number(limit);
  res.json(Number.isInteger(max) && max > 0 ? results.slice(0, max) : results);
};

// GET /api/documents/:id
export const getDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id).populate(
    "knowledgeBase",
    KNOWLEDGE_BASE_FIELDS,
  );
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const [counts, relatedIssues] = await Promise.all([
    recentTicketCounts([doc._id]),
    SupportIssue.find({ relatedDocument: doc._id }).sort({ updatedAt: -1 }),
  ]);

  res.json({
    ...withDebtScore(doc, counts.get(doc._id.toString()) ?? 0),
    relatedIssues,
  });
};

// POST /api/documents
export const createDocument = async (req, res) => {
  const data = req.body ?? {};
  await ensureKnowledgeBaseExists(data.knowledgeBase);

  const document = await Document.create(data);
  res.status(201).json(document);
};

// PUT /api/documents/:id
export const updateDocument = async (req, res) => {
  const updates = req.body ?? {};
  if (updates.knowledgeBase)
    await ensureKnowledgeBaseExists(updates.knowledgeBase);

  const document = await Document.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!document) return res.status(404).json({ message: "Document not found" });
  res.json(document);
};

// PATCH /api/documents/:id/review
export const markReviewed = async (req, res) => {
  const document = await Document.findByIdAndUpdate(
    req.params.id,
    { lastReviewedAt: new Date(), negativeFeedback: 0, missingInfo: false },
    { new: true },
  );
  if (!document) return res.status(404).json({ message: "Document not found" });
  res.json(document);
};

// PATCH /api/documents/:id/archive
export const archiveDocument = async (req, res) => {
  const document = await Document.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    { new: true },
  );
  if (!document) return res.status(404).json({ message: "Document not found" });
  res.json(document);
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) return res.status(404).json({ message: "Document not found" });
  res.json({ message: "Document deleted", id: document._id });
};
