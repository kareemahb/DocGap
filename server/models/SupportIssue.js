import mongoose from "mongoose";

// Exported so the KnowledgeGap model can reuse the same list
export const ROOT_CAUSES = [
  "missing_documentation",
  "outdated_documentation",
  "confusing_documentation",
  "product_bug",
  "user_education",
  "product_limitation",
];

const supportIssueSchema = new mongoose.Schema(
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
    rootCause: {
      type: String,
      enum: ROOT_CAUSES,
      required: [true, "Root cause is required"],
    },
    relatedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    occurrences: {
      type: [Date],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "monitoring", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// A calculated field: not stored, worked out each time it's read
supportIssueSchema.virtual("ticketCount").get(function () {
  return this.occurrences.length;
});

const SupportIssue = mongoose.model("SupportIssue", supportIssueSchema);

export default SupportIssue;
