import Document from "../models/Document.js";

// Throws a 400 if the id doesn't match an existing document
export const ensureDocumentExists = async (documentId) => {
  if (!documentId) return;
  const exists = await Document.exists({ _id: documentId });
  if (!exists) {
    const error = new Error("Linked document not found");
    error.status = 400;
    throw error;
  }
};
