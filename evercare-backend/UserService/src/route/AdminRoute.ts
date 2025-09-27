import express from "express";
import {
  adminLogin,
  getCurrentAdmin,
  getUserById,
} from "../controller/AdminController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", adminLogin); 
router.get("/user/:userId", getUserById); // For ChatService to get user info

// Protected routes (authentication required)
router.get("/me", authenticateToken, getCurrentAdmin); 

export default router;
