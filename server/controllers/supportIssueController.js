import SupportIssue from "../models/SupportIssue.js";
import { ensureDocumentExists } from "../utils/ensureDocumentExists.js";

// Loads each issue's document title plus its knowledge base name and color
const RELATED_DOCUMENT_POPULATE = {
  path: "relatedDocument",
  select: "title knowledgeBase",
  populate: { path: "knowledgeBase", select: "name color" },
};

// Turns user input into a valid, non-future Date, or throws a 400
const parseOccurredAt = (value) => {
  if (!value) return new Date();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`Invalid date: ${value}`);
    error.status = 400;
    throw error;
  }
  if (date > new Date()) {
    const error = new Error("Occurrence date can't be in the future");
    error.status = 400;
    throw error;
  }
  return date;
};

// GET /api/issues?linked=false&rootCause=product_bug&status=open&document=<id>
export const getIssues = async (req, res) => {
  const { rootCause, status, document, linked } = req.query;

  const filter = {};
  if (rootCause) filter.rootCause = rootCause;
  if (status) filter.status = status;
  if (document) filter.relatedDocument = document;
  if (linked === "false") filter.relatedDocument = null;
  if (linked === "true") filter.relatedDocument = { $ne: null };

  const issues = await SupportIssue.find(filter)
    .populate(RELATED_DOCUMENT_POPULATE)
    .sort({ updatedAt: -1 });

  res.json(issues);
};

// GET /api/issues/:id
export const getIssue = async (req, res) => {
  const issue = await SupportIssue.findById(req.params.id).populate(
    RELATED_DOCUMENT_POPULATE,
  );
  if (!issue)
    return res.status(404).json({ message: "Support issue not found" });
  res.json(issue);
};

// POST /api/issues
export const createIssue = async (req, res) => {
  const { occurrences, ...data } = req.body ?? {};
  await ensureDocumentExists(data.relatedDocument);

  const issue = await SupportIssue.create({
    ...data,
    occurrences:
      Array.isArray(occurrences) && occurrences.length > 0
        ? occurrences.map(parseOccurredAt)
        : [new Date()],
  });

  res.status(201).json(issue);
};

// PUT /api/issues/:id: edits details, never the occurrence history.
// Send { "relatedDocument": null } to unlink an issue from its document.
export const updateIssue = async (req, res) => {
  const { occurrences, ...updates } = req.body ?? {};
  if (updates.relatedDocument)
    await ensureDocumentExists(updates.relatedDocument);

  const issue = await SupportIssue.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!issue)
    return res.status(404).json({ message: "Support issue not found" });
  res.json(issue);
};

// POST /api/issues/:id/occurrences   body (optional): { "occurredAt": "2026-11-01" }
export const logOccurrence = async (req, res) => {
  const occurredAt = parseOccurredAt(req.body?.occurredAt);

  const issue = await SupportIssue.findByIdAndUpdate(
    req.params.id,
    { $push: { occurrences: occurredAt } },
    { new: true },
  );
  if (!issue)
    return res.status(404).json({ message: "Support issue not found" });
  res.status(201).json(issue);
};

// DELETE /api/issues/:id
export const deleteIssue = async (req, res) => {
  const issue = await SupportIssue.findByIdAndDelete(req.params.id);
  if (!issue)
    return res.status(404).json({ message: "Support issue not found" });
  res.json({ message: "Support issue deleted", id: issue._id });
};
