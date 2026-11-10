import { Router } from "express";
import {
  getOverview,
  getKnowledgeBaseHealth,
  getTicketTrend,
  getFixImpact,
  getFixes,
} from "../controllers/analyticsController.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/knowledge-bases", getKnowledgeBaseHealth);
router.get("/tickets-trend", getTicketTrend);
router.get("/fixes", getFixes);
router.get("/fix-impact/:gapId", getFixImpact);

export default router;
