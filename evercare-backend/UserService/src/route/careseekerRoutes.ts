import express from "express";
import {
  registerUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser,
  refreshToken,
  getCareseekerById,
} from "../controller/careseekerController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes (no authentication required)
router.post("/", registerUser); 
router.post("/login", loginUser); 
router.post("/refresh-token", refreshToken);

// Protected routes (authentication required)
router.get("/me", authenticateToken, getCurrentUser); 
router.get("/:careseekerId", getCareseekerById); // Public route for admin use
router.put("/:careseekerId", authenticateToken, updateUser); 
router.delete("/:careseekerId", authenticateToken, deleteUser); 

export default router;
