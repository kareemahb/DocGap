import { Router } from "express";
import {
  getGaps,
  getGap,
  createGap,
  updateGap,
  assignGap,
  resolveGap,
  archiveGap,
  deleteGap,
} from "../controllers/knowledgeGapController.js";

const router = Router();

router.route("/").get(getGaps).post(createGap);
router.route("/:id").get(getGap).put(updateGap).delete(deleteGap);
router.patch("/:id/assign", assignGap);
router.patch("/:id/resolve", resolveGap);
router.patch("/:id/archive", archiveGap);

export default router;
