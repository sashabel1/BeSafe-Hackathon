import { Router } from "express";
import {
  signup,
  login,
  me,
  updateProfile,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Auth
router.post("/signup", signup);
router.post("/login", login);

// Logged-in user
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);

export default router;
