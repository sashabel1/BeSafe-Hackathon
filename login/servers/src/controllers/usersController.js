const User = require("../models/UserModel");

exports.listUsers = async (_req, res) => {
  try {
    const users = await User.find({})
      .select("name nickname profilePic isEmailVerified isProfileComplete")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: "Failed to load users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name nickname profilePic age gender isEmailVerified isProfileComplete createdAt");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Failed to load user" });
  }
};
exports.seedUsers = async (req, res) => {
  try {
    const count = Number(req.query.count || 10);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("123456", salt);

    const demo = Array.from({ length: count }).map((_, i) => ({
      name: `Demo User ${i + 1}`,
      nickname: `demo${i + 1}`,
      email: `demo${i + 1}@test.com`,
      password: hashed,
      isEmailVerified: true,
      isProfileComplete: true,
      age: 18 + (i % 10),
      gender: i % 3 === 0 ? "female" : i % 3 === 1 ? "male" : "other",
      profilePic: "",
    }));

    const emails = demo.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    await User.insertMany(demo);

    return res.json({ message: `Seeded ${count} demo users` });
  } catch (e) {
    console.log("seedUsers error:", e);
    return res.status(500).json({ message: "Failed to seed users" });
  }
};