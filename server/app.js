import express from "express";
import cors from "cors";
import morgan from "morgan";

import documentRoutes from "./routes/documentRoutes.js";
import knowledgeGapRoutes from "./routes/knowledgeGapRoutes.js";
import supportIssueRoutes from "./routes/supportIssueRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware: runs on every request, in this order
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "docgap-api" });
});

// Routes
app.use("/api/documents", documentRoutes);
app.use("/api/gaps", knowledgeGapRoutes);
app.use("/api/issues", supportIssueRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling: must come AFTER all routes
app.use(notFound);
app.use(errorHandler);

export default app;
