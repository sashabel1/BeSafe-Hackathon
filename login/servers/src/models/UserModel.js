
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, minlength: 3, maxlength: 200 },
    password: { type: String, required: true, minlength: 3, maxlength: 1024 },

    isEmailVerified: { type: Boolean, default: false },

    
    nickname: { type: String, default: "", maxlength: 30 },
    age: { type: Number, default: null, min: 8, max: 120 },
    gender: { type: String, enum: ["female", "male", "other", ""], default: "" },
    profilePic: { type: String, default: "" }, 

    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
