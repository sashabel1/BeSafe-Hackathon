import { Conversation } from "../models/ConversationModel.js";

/**
 * GET /conversations?userId=...
 * Returns all conversations where userId is a participant (most recent first).
 */
export async function getUserConversations(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(conversations);
  } catch (err) {
    console.error("getUserConversations error:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
}

/**
 * POST /conversations/personal
 * body: { userId, otherUserId }
 * Creates or returns an existing personal conversation between 2 users.
 */
export async function createOrGetPersonalConversation(req, res) {
  try {
    const { userId, otherUserId } = req.body;
    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "Missing userId / otherUserId" });
    }
    if (String(userId) === String(otherUserId)) {
      return res.status(400).json({ error: "Cannot create personal conversation with yourself" });
    }

    // Find existing personal conversation with exactly these 2 participants
    const existing = await Conversation.findOne({
      type: "personal",
      participants: { $all: [userId, otherUserId] },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    }).lean();

    if (existing) return res.json(existing);

    const created = await Conversation.create({
      type: "personal",
      topic: "",
      participants: [userId, otherUserId],
      admins: [],
      lastMessageText: "",
      lastMessageAt: null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("createOrGetPersonalConversation error:", err);
    res.status(500).json({ error: "Failed to create personal conversation" });
  }
}

/**
 * POST /conversations/group
 * body: { creatorId, topic, participantIds }
 * Creates a group conversation.
 */
export async function createGroupConversation(req, res) {
  try {
    const { creatorId, topic, participantIds } = req.body;

    if (!creatorId) return res.status(400).json({ error: "Missing creatorId" });
    if (!topic || !topic.trim()) return res.status(400).json({ error: "Missing topic" });

    const ids = Array.isArray(participantIds) ? participantIds : [];
    const all = [creatorId, ...ids].map(String);

    // unique participants
    const unique = [...new Set(all)];

    if (unique.length < 2) {
      return res.status(400).json({ error: "Group must have at least 2 participants" });
    }

    const created = await Conversation.create({
      type: "group",
      topic: topic.trim(),
      participants: unique,
      admins: [creatorId],
      lastMessageText: "",
      lastMessageAt: null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("createGroupConversation error:", err);
    res.status(500).json({ error: "Failed to create group conversation" });
  }
}
