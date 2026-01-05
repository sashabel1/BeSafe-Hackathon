import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    // The conversation this message belongs to
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // The user who sent the message
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast retrieval of messages by conversation and creation time
messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
