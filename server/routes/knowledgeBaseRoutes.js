import { Router } from "express";
import {
  getKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from "../controllers/knowledgeBaseController.js";

const router = Router();

router.route("/").get(getKnowledgeBases).post(createKnowledgeBase);
router.route("/:id").put(updateKnowledgeBase).delete(deleteKnowledgeBase);

export default router;
