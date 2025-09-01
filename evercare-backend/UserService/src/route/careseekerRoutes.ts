import express from "express";
import {
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser,
} from "../controller/careseekerController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", registerUser); // Registration
router.post("/login", loginUser); // Login

// Protected routes (authentication required)
router.get("/me", authMiddleware, getCurrentUser); // Get current user profile
router.put("/:careseekerId", authMiddleware, updateUser); // Update user
router.delete("/:careseekerId", authMiddleware, deleteUser); // Delete user

export default router;
