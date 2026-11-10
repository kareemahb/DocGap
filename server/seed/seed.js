import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import KnowledgeBase from "../models/KnowledgeBase.js";
import Document from "../models/Document.js";
import SupportIssue from "../models/SupportIssue.js";
import KnowledgeGap from "../models/KnowledgeGap.js";
import { buildDemoData } from "./demoData.js";

// Safety check: never wipe a production database by accident
if (
  process.env.NODE_ENV === "production" &&
  !process.argv.includes("--force")
) {
  console.error(
    "Refusing to seed in production. Add --force if you really mean it.",
  );
  process.exit(1);
}

const { knowledgeBases, documents, issues, gaps } = buildDemoData();

await connectDB();

// 1. Clear existing data
await Promise.all([
  KnowledgeBase.deleteMany(),
  Document.deleteMany(),
  SupportIssue.deleteMany(),
  KnowledgeGap.deleteMany(),
]);
console.log("Cleared existing data");

// 2. Knowledge bases, then remember each one's real _id by its key
const insertedKnowledgeBases = await KnowledgeBase.insertMany(
  knowledgeBases.map(({ key, ...knowledgeBase }) => knowledgeBase),
);
const knowledgeBaseIds = new Map(
  knowledgeBases.map((knowledgeBase, i) => [
    knowledgeBase.key,
    insertedKnowledgeBases[i]._id,
  ]),
);

// 3. Documents, linked to their knowledge base
const insertedDocuments = await Document.insertMany(
  documents.map(({ key, kb, ...doc }) => ({
    ...doc,
    knowledgeBase: knowledgeBaseIds.get(kb),
  })),
);
const documentIds = new Map(
  documents.map((doc, i) => [doc.key, insertedDocuments[i]._id]),
);

// 4. Support issues, linked to a document when they have one
await SupportIssue.insertMany(
  issues.map(({ doc, ...issue }) => ({
    ...issue,
    ...(doc && { relatedDocument: documentIds.get(doc) }),
  })),
);

// 5. Knowledge gaps
const insertedGaps = await KnowledgeGap.insertMany(
  gaps.map(({ doc, createdAt, ...gap }) => ({
    ...gap,
    document: documentIds.get(doc),
  })),
);

// Backdate when each gap was opened (Mongoose always stamps "now", so this
// writes straight to MongoDB). Average fix time is measured from this date.
await KnowledgeGap.collection.bulkWrite(
  insertedGaps.map((gap, i) => ({
    updateOne: {
      filter: { _id: gap._id },
      update: { $set: { createdAt: gaps[i].createdAt } },
    },
  })),
);

console.log(
  `Seed complete: ${insertedKnowledgeBases.length} knowledge bases, ${insertedDocuments.length} documents, ` +
    `${issues.length} support issues, ${insertedGaps.length} knowledge gaps`,
);

await mongoose.disconnect();
