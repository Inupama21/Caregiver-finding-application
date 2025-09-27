import express from "express";
import {
  deleteCaregiver,
  registerCaregiver,
  updateCaregiver,
  loginCaregiver,
  refreshToken,
  getCurrentCaregiver,
  getCaregiverById,
} from "../controller/caregiverController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/", registerCaregiver);
router.post("/login", loginCaregiver);
router.post("/refresh-token", refreshToken);

// Protected routes 
router.get("/me", authenticateToken, getCurrentCaregiver);
router.get("/:caregiverId", getCaregiverById); // Public route for admin use
router.put("/:caregiverId", authenticateToken, updateCaregiver);
router.delete("/:caregiverId", authenticateToken, deleteCaregiver);

export default router;
