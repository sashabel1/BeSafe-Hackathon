import { Router } from "express";
import { analyze, chat } from "../controllers/aiController.js";

const router = Router();

router.post("/analyze", analyze);
router.post("/chat", chat);

export default router;
