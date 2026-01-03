import { Router } from "express";
import { analyze, chat , validateOutgoingMessage} from "../controllers/aiController.js";

const router = Router();

router.post("/analyze", analyze);
router.post("/chat", chat);

router.post("/validate-message", validateOutgoingMessage);

export default router;
