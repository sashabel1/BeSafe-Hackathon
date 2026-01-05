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


// PUT /users/:id/block
export async function toggleUserBlock(req, res) {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body; 

    const updateData = { isBlocked: isBlocked };
    if (isBlocked === false) {
      updateData.strikes = 0;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData, 
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch { 
    res.status(500).json({ error: "Failed to update block status" });
  }
}

// PUT /users/:id/strikes
export async function updateUserStrikes(req, res) {
  try {
    const { id } = req.params;
    let { strikes } = req.body; 

    if (strikes < 0) return res.status(400).json({ error: "Strikes cannot be negative" });

    if (strikes >= 3) {
      strikes = 3;
    }

    const updateData = { strikes: strikes };
    if (strikes === 3) {
      updateData.isBlocked = true;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch { 
    res.status(500).json({ error: "Failed to update strikes" });
  }
}