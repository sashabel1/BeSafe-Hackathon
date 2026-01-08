
const express = require("express");
const {
  signup,
  verifyEmail,
  login,
  logout,
  me,
  updateProfile,
} = require("../controllers/controller");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.post("/signup", signup);
router.get("/verify-email", verifyEmail);

router.post("/login", login);
router.post("/logout", logout);

router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

module.exports = router;
