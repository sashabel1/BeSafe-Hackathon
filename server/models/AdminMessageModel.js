import mongoose from "mongoose";
const { Schema } = mongoose;

const adminMessageSchema = new Schema(
  {
    // The user who sent the message
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message title
    title: {
      type: String,
      required: true,
      trim: true,
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

export const AdminMessage = mongoose.model("AdminMessage", adminMessageSchema);
