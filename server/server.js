import path from "node:path";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import documentRoutes from "./routes/documentRoutes.js";
import knowledgeGapRoutes from "./routes/knowledgeGapRoutes.js";
import supportIssueRoutes from "./routes/supportIssueRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import knowledgeBaseRoutes from "./routes/knowledgeBaseRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Websites allowed to call this API from a different address, e.g. "http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Middleware: runs on every request, in this order
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "docgap-api" });
});

// API routes
app.use("/api/documents", documentRoutes);
app.use("/api/gaps", knowledgeGapRoutes);
app.use("/api/issues", supportIssueRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/knowledge-bases", knowledgeBaseRoutes);

// In production, this same server also serves the built React app (client/dist)
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(import.meta.dirname, "../client/dist");

  // The built files: index.html, JavaScript, CSS, images
  app.use(express.static(clientDist));

  // Any other page (like /documents or /reports) gets index.html, and React Router shows the right screen.
  // API requests skip this, so a wrong /api URL still gets a JSON 404.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Error handling: must come AFTER all routes
app.use(notFound);
app.use(errorHandler);

export default app;
