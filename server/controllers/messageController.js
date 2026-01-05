import { Conversation } from "../models/ConversationModel.js";
import { Message } from "../models/MessageModel.js";
import { User } from "../models/UserModel.js";

/**
 * GET /conversations/:conversationId/messages?userId=...
 * Returns messages for a conversation (oldest -> newest).
 */
export async function getConversationMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!conversationId) return res.status(400).json({ error: "Missing conversationId" });
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const convo = await Conversation.findById(conversationId).lean();
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    // access control (even without auth, we can still validate membership)
    const isParticipant = convo.participants.some((p) => String(p) === String(userId));
    if (!isParticipant) return res.status(403).json({ error: "Not a participant in this conversation" });

    const msgs = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Map to your UI format
    const mapped = msgs.map((m) => ({
      id: String(m._id),
      sender: String(m.senderId) === String(userId) ? "me" : "them",
      text: m.text,
      ts: new Date(m.createdAt).getTime(),
      senderId: String(m.senderId),
    }));

    res.json(mapped);
  } catch (err) {
    console.error("getConversationMessages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
}

/**
 * POST /conversations/:conversationId/messages
 * body: { userId, text }
 * Saves a new message and updates conversation lastMessage fields.
 */
export async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const { userId, text } = req.body;

    if (!conversationId) return res.status(400).json({ error: "Missing conversationId" });
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const clean = (text || "").trim();
    if (!clean) return res.status(400).json({ error: "Message text is empty" });

    // Blocked user check (matches your User schema)
    const senderUser = await User.findById(userId).select("isBlocked strikes").lean();
    if (!senderUser) return res.status(404).json({ error: "User not found" });
    if (senderUser.isBlocked) return res.status(403).json({ error: "User is blocked" });

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const isParticipant = convo.participants.some((p) => String(p) === String(userId));
    if (!isParticipant) return res.status(403).json({ error: "Not a participant in this conversation" });

    // TODO (later): call AI moderation here BEFORE saving, update strikes/isBlocked if needed
    //now this in chatPage, maybe its ok

    const doc = await Message.create({
      conversationId,
      senderId: userId,
      text: clean,
    });

    // Update conversation preview fields
    convo.lastMessageText = clean;
    convo.lastMessageAt = doc.createdAt;
    await convo.save();

    // Return in UI-friendly format
    res.status(201).json({
      id: String(doc._id),
      sender: "me",
      text: doc.text,
      ts: new Date(doc.createdAt).getTime(),
      senderId: String(doc.senderId),
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}
