import express from "express";
import { AdminMessage } from "../models/AdminMessageModel.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, text } = req.body;

    const message = new AdminMessage({
      senderId: req.userId, // מגיע מה-JWT
      title,
      text,
    });

    await message.save();

    res.status(201).json({ message: "Message saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save message" });
  }
});

export default router;
