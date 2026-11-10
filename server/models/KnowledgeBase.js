import mongoose from "mongoose";

// Color keys the frontend maps to Tailwind classes
export const KNOWLEDGE_BASE_COLORS = ["black", "yellow", "blue", "green"];

const knowledgeBaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
    },
    color: {
      type: String,
      enum: KNOWLEDGE_BASE_COLORS,
      default: "black",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const KnowledgeBase = mongoose.model("KnowledgeBase", knowledgeBaseSchema);

export default KnowledgeBase;
