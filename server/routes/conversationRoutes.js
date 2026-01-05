import { Router } from "express";
import {
  getUserConversations,
  createOrGetPersonalConversation,
  createGroupConversation,
} from "../controllers/conversationController.js";
import {
  getConversationMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = Router();

router.get("/", getUserConversations);
router.post("/personal", createOrGetPersonalConversation);
router.post("/group", createGroupConversation);

router.get("/:conversationId/messages", getConversationMessages);
router.post("/:conversationId/messages", sendMessage);

export default router;
