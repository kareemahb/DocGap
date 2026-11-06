import Document from "../models/Document.js";
import SupportIssue from "../models/SupportIssue.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { calculateDebtScore } from "../utils/debtScore.js";
import { recentTicketCounts } from "../services/ticketStats.js";

// Combines a document with its ticket count and debt score
const withDebtScore = (doc, ticketCount) => ({
  ...doc.toObject(),
  recentTicketCount: ticketCount,
  debt: calculateDebtScore(doc, ticketCount),
});

// GET /api/documents?category=IT&owner=rivera&status=active&severity=critical&q=mfa&sort=debt
export const getDocuments = async (req, res) => {
  const {
    category,
    owner,
    status = "active",
    severity,
    q,
    sort = "debt",
  } = req.query;

  const filter = {};
  if (status !== "all") filter.status = status;
  if (category) filter.category = category;
  if (owner) filter.owner = new RegExp(escapeRegex(owner), "i");
  if (q) filter.$text = { $search: q };

  const docs = await Document.find(filter);
  const counts = await recentTicketCounts(docs.map((doc) => doc._id));

  let results = docs.map((doc) =>
    withDebtScore(doc, counts.get(doc._id.toString()) ?? 0),
  );

  if (severity)
    results = results.filter((doc) => doc.debt.severity === severity);

  if (sort === "debt") results.sort((a, b) => b.debt.score - a.debt.score);
  if (sort === "title") results.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "updated") results.sort((a, b) => b.updatedAt - a.updatedAt);

  res.json(results);
};

// GET /api/documents/:id
export const getDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
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
  const document = await Document.create(req.body);
  res.status(201).json(document);
};

// PUT /api/documents/:id
export const updateDocument = async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
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
