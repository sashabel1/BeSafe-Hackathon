import { User } from "../models/UserModel.js";

// GET /users
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// GET /users/:id
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('passwordHash');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(400).json({ error: "Invalid user id" });
  }
}

