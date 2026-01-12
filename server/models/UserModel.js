import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    nickname: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    age: { type: Number, min: 0 },

    avatarUrl: { type: String, default: "" },
    profileCompleted: { type: Boolean, default: false },

    //property to track user violations 
    strikes: { type: Number, default: 0 }, 
    isBlocked: { type: Boolean, default: false } ,
    isAdmin: { type: Boolean, default: false } 
  },
  { timestamps: true } // createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema);
