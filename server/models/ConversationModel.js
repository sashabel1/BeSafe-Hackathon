import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["personal", "group"],
      required: true,
    },

    // For group conversations: usually required
    // For personal conversations: typically empty (the UI shows the other participant's name)
    topic: {
      type: String,
      trim: true,
      default: "",
    },

    // All participants in the conversation (2 for personal, 2+ for group)
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],

    // Group admins (relevant only for group conversations)
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Used for sidebar preview and sorting
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for fast retrieval of a user's conversations, sorted by recent activity
conversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
