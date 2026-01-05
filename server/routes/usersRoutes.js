import { Router } from "express";
import { 
  getAllUsers, 
  getUserById, 
  toggleUserBlock, 
  updateUserStrikes 
} from "../controllers/usersController.js";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.put("/:id/block", toggleUserBlock);
router.put("/:id/strikes", updateUserStrikes);

export default router;
