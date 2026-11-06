import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Document from "../models/Document.js";
import SupportIssue from "../models/SupportIssue.js";
import KnowledgeGap from "../models/KnowledgeGap.js";

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

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY_MS);

// Spreads `count` dates evenly between `startDaysAgo` and `endDaysAgo`
const spread = (count, startDaysAgo, endDaysAgo) =>
  Array.from({ length: count }, (_, i) =>
    daysAgo(
      startDaysAgo - ((startDaysAgo - endDaysAgo) * i) / Math.max(count - 1, 1),
    ),
  );

await connectDB();

// 1. Clear existing data
await Promise.all([
  Document.deleteMany(),
  SupportIssue.deleteMany(),
  KnowledgeGap.deleteMany(),
]);
console.log("Cleared existing data");

// 2. Documents
const [mfa, vpn, refund, laptop, password, printer] = await Document.insertMany(
  [
    {
      title: "MFA Reset Procedure",
      category: "IT",
      type: "SOP",
      owner: "J. Rivera",
      lastReviewedAt: daysAgo(245),
      negativeFeedback: 14,
      missingInfo: true,
      businessImpact: "critical",
    },
    {
      title: "VPN Setup for Contractors",
      category: "IT",
      type: "Guide",
      owner: "A. Chen",
      lastReviewedAt: daysAgo(330),
      negativeFeedback: 9,
      missingInfo: true,
      businessImpact: "high",
    },
    {
      title: "Refund Escalation SOP",
      category: "Support",
      type: "SOP",
      owner: "M. Lee",
      lastReviewedAt: daysAgo(120),
      negativeFeedback: 11,
      businessImpact: "high",
    },
    {
      title: "New Hire Laptop Runbook",
      category: "Ops",
      type: "Runbook",
      owner: "D. Patel",
      lastReviewedAt: daysAgo(60),
      negativeFeedback: 4,
      businessImpact: "medium",
    },
    {
      title: "Password Policy",
      category: "Security",
      type: "Policy",
      owner: "S. Kim",
      lastReviewedAt: daysAgo(21),
      negativeFeedback: 0,
      businessImpact: "medium",
    },
    {
      title: "Printer Driver Install Guide",
      category: "IT",
      type: "KB Article",
      owner: "J. Rivera",
      lastReviewedAt: daysAgo(30),
      negativeFeedback: 1,
      businessImpact: "low",
    },
  ],
);

// 3. Support issues, each with realistic ticket dates
await SupportIssue.insertMany([
  {
    title: "Users locked out after MFA device change",
    rootCause: "outdated_documentation",
    relatedDocument: mfa._id,
    occurrences: spread(32, 85, 1),
  },
  {
    title: "Contractors cannot connect to VPN",
    rootCause: "missing_documentation",
    relatedDocument: vpn._id,
    occurrences: spread(21, 80, 2),
  },
  {
    title: "Agents unsure when to escalate refunds",
    rootCause: "confusing_documentation",
    relatedDocument: refund._id,
    occurrences: spread(14, 70, 3),
  },
  {
    title: "New hires missing software on day one",
    rootCause: "user_education",
    relatedDocument: laptop._id,
    occurrences: spread(6, 60, 5),
  },
  {
    title: "Password reset email delayed",
    rootCause: "product_bug",
    relatedDocument: password._id,
    occurrences: spread(1, 10, 10),
  },
  // "Did the Fix Work?" demo: 32 tickets in the 30 days before the fix, 9 after
  {
    title: "Printer driver install fails on new laptops",
    rootCause: "outdated_documentation",
    relatedDocument: printer._id,
    status: "monitoring",
    occurrences: [...spread(32, 59, 31), ...spread(9, 29, 1)],
  },
]);

// 4. Knowledge gaps at different workflow stages
await KnowledgeGap.insertMany([
  {
    title: "MFA reset steps reference retired authenticator app",
    document: mfa._id,
    rootCause: "outdated_documentation",
    recommendedAction: "update_existing",
    priority: "critical",
    status: "in_progress",
    assignee: "J. Rivera",
  },
  {
    title: "No contractor-specific VPN instructions",
    document: vpn._id,
    rootCause: "missing_documentation",
    recommendedAction: "create_new",
    priority: "critical",
    status: "open",
  },
  {
    title: "Refund escalation thresholds unclear",
    document: refund._id,
    rootCause: "confusing_documentation",
    recommendedAction: "clarify",
    priority: "high",
    status: "in_review",
    assignee: "M. Lee",
  },
  {
    title: "Printer guide missing new driver version",
    document: printer._id,
    rootCause: "outdated_documentation",
    recommendedAction: "update_existing",
    priority: "high",
    status: "resolved",
    assignee: "J. Rivera",
    resolvedAt: daysAgo(30),
  },
]);

console.log("Seed complete: 6 documents, 6 support issues, 4 knowledge gaps");
await mongoose.disconnect();
