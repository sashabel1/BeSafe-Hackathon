import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js"; 

/* -------------------- helpers -------------------- */
function createJwt(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/* -------------------- SIGN UP -------------------- */
export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      profileCompleted: true,//todo: change to false and write profile setup page
      strikes: 0,
      isBlocked: false,
    });

    const token = createJwt(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------- LOGIN -------------------- */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createJwt(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        profileCompleted: user.profileCompleted,
        strikes: user.strikes,
        isBlocked: user.isBlocked,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------- ME -------------------- */
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------- UPDATE PROFILE -------------------- */
export const updateProfile = async (req, res) => {
  try {
    const { nickname, age, gender, avatarUrl } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (nickname !== undefined) user.nickname = nickname;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    user.profileCompleted =
      Boolean(user.nickname) &&
      Number.isFinite(user.age) &&
      ["male", "female", "other"].includes(user.gender);

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    return res.json({ user: safeUser });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
