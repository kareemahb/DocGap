import KnowledgeBase from "../models/KnowledgeBase.js";
import Document from "../models/Document.js";

// GET /api/knowledge-bases: every knowledge base with its document count
export const getKnowledgeBases = async (req, res) => {
  const [knowledgeBases, counts] = await Promise.all([
    KnowledgeBase.find().sort({ name: 1 }),
    Document.aggregate([
      { $match: { status: { $ne: "archived" } } },
      { $group: { _id: "$knowledgeBase", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((row) => [String(row._id), row.count]));

  res.json(
    knowledgeBases.map((kb) => ({
      ...kb.toObject(),
      documentCount: countMap.get(kb._id.toString()) ?? 0,
    })),
  );
};

// POST /api/knowledge-bases
export const createKnowledgeBase = async (req, res) => {
  const knowledgeBase = await KnowledgeBase.create(req.body ?? {});
  res.status(201).json(knowledgeBase);
};

// PUT /api/knowledge-bases/:id
export const updateKnowledgeBase = async (req, res) => {
  const knowledgeBase = await KnowledgeBase.findByIdAndUpdate(
    req.params.id,
    req.body ?? {},
    {
      new: true,
      runValidators: true,
    },
  );
  if (!knowledgeBase)
    return res.status(404).json({ message: "Knowledge base not found" });
  res.json(knowledgeBase);
};

// DELETE /api/knowledge-bases/:id: only allowed when it has no documents
export const deleteKnowledgeBase = async (req, res) => {
  const documentCount = await Document.countDocuments({
    knowledgeBase: req.params.id,
  });
  if (documentCount > 0) {
    return res.status(409).json({
      message: `Move or delete its ${documentCount} documents before deleting this knowledge base`,
    });
  }

  const knowledgeBase = await KnowledgeBase.findByIdAndDelete(req.params.id);
  if (!knowledgeBase)
    return res.status(404).json({ message: "Knowledge base not found" });
  res.json({ message: "Knowledge base deleted", id: knowledgeBase._id });
};
