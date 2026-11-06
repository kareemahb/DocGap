import { Router } from "express";
import {
  getOverview,
  getFixImpact,
  getFixes,
} from "../controllers/analyticsController.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/fixes", getFixes);
router.get("/fix-impact/:gapId", getFixImpact);

export default router;
