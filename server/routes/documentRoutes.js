import { Router } from "express";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  markReviewed,
  archiveDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = Router();

router.route("/").get(getDocuments).post(createDocument);
router
  .route("/:id")
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);
router.patch("/:id/review", markReviewed);
router.patch("/:id/archive", archiveDocument);

export default router;
