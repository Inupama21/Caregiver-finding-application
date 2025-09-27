import express from "express";
import {
  createOrUpdateProfile,
  getProfileByCareseekerID,
  updateAboutSection,
  updateMedicalSection,
  updatePreferencesSection,
  updateRating,
  deleteProfile,
  getAllProfiles,
} from "../controller/careseekerProfileController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Non-authenticated routes (for development/testing)
router.get("/:careseekerId", getProfileByCareseekerID); // Get profile by careseeker ID (no auth)
router.post("/", createOrUpdateProfile); // Create or update complete profile (no auth)
router.put("/:careseekerId", createOrUpdateProfile); // Update complete profile (no auth)

// Main profile routes - All require authentication
router.post("/auth", authenticateToken, createOrUpdateProfile); // Create or update complete profile
router.get("/auth/all", authenticateToken, getAllProfiles); // Get all profiles (admin)
router.get("/auth/:careseekerId", authenticateToken, getProfileByCareseekerID); // Get profile by careseeker ID
router.delete("/auth/:careseekerId", authenticateToken, deleteProfile); // Delete profile

// Section-specific update routes - All require authentication
router.put("/auth/:careseekerId/about", authenticateToken, updateAboutSection); // Update about section
router.put("/auth/:careseekerId/medical", authenticateToken, updateMedicalSection); // Update medical section
router.put(
  "/auth/:careseekerId/preferences",
  authenticateToken,
  updatePreferencesSection
); // Update preferences section
router.put("/auth/:careseekerId/rating", authenticateToken, updateRating); // Update rating

export default router;
