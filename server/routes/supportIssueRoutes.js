import { Router } from "express";
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  logOccurrence,
  deleteIssue,
} from "../controllers/supportIssueController.js";

const router = Router();

router.route("/").get(getIssues).post(createIssue);
router.route("/:id").get(getIssue).put(updateIssue).delete(deleteIssue);
router.post("/:id/occurrences", logOccurrence);

export default router;
