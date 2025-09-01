import express from "express";
import {
  getAllCaregiverProfiles,
  getCaregiverProfile,
  createCaregiverProfile,
  updateCaregiverProfile,
  deleteCaregiverProfile,
  uploadProfilePhoto,
  getCaregiverPosts,
  createCaregiverPost,
  updateCaregiverPost,
  deleteCaregiverPost,
  likeCaregiverPost,
  commentCaregiverPost,
} from "../controller/caregiverProfileController";

const router = express.Router();

// Caregiver Profile Routes
router.get("/", getAllCaregiverProfiles); // GET /api/caregiverProfile
router.get("/:caregiverId", getCaregiverProfile); // GET /api/caregiverProfile/:caregiverId
router.post("/", createCaregiverProfile); // POST /api/caregiverProfile
router.put("/:caregiverId", updateCaregiverProfile); // PUT /api/caregiverProfile/:caregiverId
router.delete("/:caregiverId", deleteCaregiverProfile); // DELETE /api/caregiverProfile/:caregiverId

// Profile Photo Upload Route
// Note: You'll need to add multer middleware in your main index.js/app.js file
router.post("/:caregiverId/upload-photo", uploadProfilePhoto); // POST /api/caregiverProfile/:caregiverId/upload-photo

// Caregiver Posts Routes - separate router for posts
const postsRouter = express.Router();

postsRouter.get("/:caregiverId", getCaregiverPosts); // GET /api/caregiverPosts/:caregiverId
postsRouter.post("/:caregiverId", createCaregiverPost); // POST /api/caregiverPosts/:caregiverId
postsRouter.put("/:caregiverId/:postId", updateCaregiverPost); // PUT /api/caregiverPosts/:caregiverId/:postId
postsRouter.delete("/:caregiverId/:postId", deleteCaregiverPost); // DELETE /api/caregiverPosts/:caregiverId/:postId
postsRouter.post("/:postId/like", likeCaregiverPost); // POST /api/caregiverPosts/:postId/like
postsRouter.post("/:postId/comment", commentCaregiverPost); // POST /api/caregiverPosts/:postId/comment

// Export both routers
export default router;
export { postsRouter };
