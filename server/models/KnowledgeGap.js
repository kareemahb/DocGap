import mongoose from "mongoose";
import { ROOT_CAUSES } from "./SupportIssue.js";

const knowledgeGapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    rootCause: {
      type: String,
      enum: ROOT_CAUSES,
    },
    recommendedAction: {
      type: String,
      enum: ["update_existing", "create_new", "clarify", "escalate_to_product"],
      default: "update_existing",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_review", "in_progress", "resolved", "archived"],
      default: "open",
    },
    assignee: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },

    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Runs automatically before every save()
knowledgeGapSchema.pre("save", async function () {
  if (!this.isModified("status")) return;

  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  if (this.status !== "resolved" && this.status !== "archived") {
    this.resolvedAt = undefined;
    this.verifiedAt = undefined;
  }
});

const KnowledgeGap = mongoose.model("KnowledgeGap", knowledgeGapSchema);

export default KnowledgeGap;
