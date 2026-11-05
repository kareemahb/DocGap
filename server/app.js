import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middleware: runs on every request, in this order
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// Health check: a quick way to confirm the API is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "docgap-api" });
});

export default app;
