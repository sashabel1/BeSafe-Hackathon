
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/UserModel");
const EmailToken = require("../models/EmailToken");
const { generateRawToken, hashToken } = require("../models/emailTokens");
const { sendVerifyEmail } = require("./emailHandlers");

function createJwt(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      isProfileComplete: false,
    });

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    await EmailToken.deleteMany({ userId: user._id });
    await EmailToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // שעה
    });

    const verifyLink = `${process.env.API_URL}/api/auth/verify-email?token=${rawToken}`;

    
    await sendVerifyEmail(user.email, user.name, verifyLink);

    return res.status(201).json({
      message: "Signup success. Verification email sent.",
    });
  } catch (err) {
    console.log("signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const rawToken = req.query.token;
    if (!rawToken) return res.status(400).send("Missing token");

    const tokenHash = hashToken(rawToken);

    const tokenDoc = await EmailToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) return res.status(400).send("Invalid or expired token");

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(400).send("User not found");

    user.isEmailVerified = true;
    await user.save();
    await EmailToken.deleteOne({ _id: tokenDoc._id });

    const jwtToken = createJwt(user._id);

    return res.redirect(`${process.env.CLIENT_URL}/profile-setup?token=${jwtToken}`);
  } catch (err) {
    console.log("verifyEmail error:", err);
    return res.status(500).send("Internal server error");
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = createJwt(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete,
        nickname: user.nickname,
        age: user.age,
        gender: user.gender,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.log("login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.logout = (_req, res) => {
  return res.json({ message: "Logged out" });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { nickname, age, gender, profilePic } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.nickname = String(nickname || "").trim();
    user.age = age === "" || age == null ? null : Number(age);
    user.gender = gender || "";
    if (profilePic) user.profilePic = profilePic;

    user.isProfileComplete =
      user.nickname.length >= 2 &&
      Number.isFinite(user.age) &&
      user.age >= 8 &&
      user.age <= 120 &&
      ["female", "male", "other"].includes(user.gender);

    await user.save();

    const safe = user.toObject();
    delete safe.password;

    return res.json({ user: safe });
  } catch (err) {
    console.log("updateProfile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
