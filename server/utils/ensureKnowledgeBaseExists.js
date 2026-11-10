import KnowledgeBase from "../models/KnowledgeBase.js";

// Throws a 400 if the id doesn't match an existing knowledge base
export const ensureKnowledgeBaseExists = async (knowledgeBaseId) => {
  if (!knowledgeBaseId) return;
  const exists = await KnowledgeBase.exists({ _id: knowledgeBaseId });
  if (!exists) {
    const error = new Error("Knowledge base not found");
    error.status = 400;
    throw error;
  }
};
