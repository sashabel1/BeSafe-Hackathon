const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/requireAuth");
const {
  listUsers,
  getUserById,
  seedUsers,
} = require("../controllers/usersController");


router.get("/", requireAuth, listUsers);


router.get("/:id", requireAuth, getUserById);


router.post("/seed", seedUsers);

module.exports = router;