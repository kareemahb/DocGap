import KnowledgeGap from "../models/KnowledgeGap.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { ensureDocumentExists } from "../utils/ensureDocumentExists.js";

// Loads each gap's document title and owner, plus its knowledge base name and color
const GAP_DOCUMENT_POPULATE = {
  path: "document",
  select: "title owner knowledgeBase",
  populate: { path: "knowledgeBase", select: "name color" },
};

// GET /api/gaps?status=open&priority=critical&assignee=rivera&document=<id>
export const getGaps = async (req, res) => {
  const { status, priority, assignee, document } = req.query;

  const filter = {};
  if (status) filter.status = status;
  else filter.status = { $ne: "archived" };
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = new RegExp(escapeRegex(assignee), "i");
  if (document) filter.document = document;

  const gaps = await KnowledgeGap.find(filter)
    .populate(GAP_DOCUMENT_POPULATE)
    .sort({ createdAt: -1 });

  res.json(gaps);
};

// GET /api/gaps/:id
export const getGap = async (req, res) => {
  const gap = await KnowledgeGap.findById(req.params.id).populate(
    GAP_DOCUMENT_POPULATE,
  );
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });
  res.json(gap);
};

// POST /api/gaps
export const createGap = async (req, res) => {
  const { resolvedAt, verifiedAt, ...data } = req.body ?? {};
  await ensureDocumentExists(data.document);

  const gap = await KnowledgeGap.create(data);
  res.status(201).json(gap);
};

// PUT /api/gaps/:id: uses save() so the resolvedAt hook runs
export const updateGap = async (req, res) => {
  const { resolvedAt, verifiedAt, ...updates } = req.body ?? {};

  const gap = await KnowledgeGap.findById(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  if (updates.document) await ensureDocumentExists(updates.document);

  gap.set(updates);
  await gap.save();
  res.json(gap);
};

// PATCH /api/gaps/:id/assign   body: { "assignee": "J. Rivera" }
export const assignGap = async (req, res) => {
  const { assignee } = req.body ?? {};
  if (!assignee)
    return res.status(400).json({ message: "Assignee is required" });

  const gap = await KnowledgeGap.findById(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  gap.assignee = assignee;
  if (gap.status === "open") gap.status = "in_progress";
  await gap.save();
  res.json(gap);
};

// PATCH /api/gaps/:id/resolve
export const resolveGap = async (req, res) => {
  const gap = await KnowledgeGap.findById(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  gap.status = "resolved";
  await gap.save();
  res.json(gap);
};

// PATCH /api/gaps/:id/archive
export const archiveGap = async (req, res) => {
  const gap = await KnowledgeGap.findById(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  gap.status = "archived";
  await gap.save();
  res.json(gap);
};

// DELETE /api/gaps/:id
export const deleteGap = async (req, res) => {
  const gap = await KnowledgeGap.findByIdAndDelete(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });
  res.json({ message: "Knowledge gap deleted", id: gap._id });
};

// PATCH /api/gaps/:id/verify: someone confirmed the fix worked
export const verifyGap = async (req, res) => {
  const gap = await KnowledgeGap.findById(req.params.id);
  if (!gap) return res.status(404).json({ message: "Knowledge gap not found" });

  if (gap.status !== "resolved") {
    return res
      .status(400)
      .json({ message: "Only resolved gaps can be verified" });
  }

  gap.verifiedAt = new Date();
  await gap.save();
  res.json(gap);
};
