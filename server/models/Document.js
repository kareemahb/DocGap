import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    knowledgeBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeBase",
      required: [true, "Knowledge base is required"],
    },
    type: {
      type: String,
      enum: ["KB Article", "SOP", "Runbook", "Guide", "Policy"],
      default: "KB Article",
    },
    url: {
      type: String,
      trim: true,
    },
    owner: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [80, "Note must be 80 characters or fewer"],
    },

    // null = the doc hasn't been written or reviewed yet
    lastReviewedAt: {
      type: Date,
      default: Date.now,
    },
    negativeFeedback: {
      type: Number,
      default: 0,
      min: [0, "Negative feedback can't be below 0"],
    },
    missingInfo: {
      type: Boolean,
      default: false,
    },
    businessImpact: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true },
);

// Enables keyword search on title and owner
documentSchema.index({ title: "text", owner: "text" });

const Document = mongoose.model("Document", documentSchema);

export default Document;
