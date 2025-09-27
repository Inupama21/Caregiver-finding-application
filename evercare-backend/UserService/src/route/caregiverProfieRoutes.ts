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
router.get("/", getAllCaregiverProfiles); 
router.get("/:caregiverId", getCaregiverProfile);
router.post("/", createCaregiverProfile); 
router.put("/:caregiverId", updateCaregiverProfile); 
router.delete("/:caregiverId", deleteCaregiverProfile); 

// Profile Photo Upload Route
//  You'll need to add multer middleware in your main index.js/app.js file
router.post("/:caregiverId/upload-photo", uploadProfilePhoto);


const postsRouter = express.Router();

postsRouter.get("/:caregiverId", getCaregiverPosts); 
postsRouter.post("/:caregiverId", createCaregiverPost);
postsRouter.put("/:caregiverId/:postId", updateCaregiverPost); 
postsRouter.delete("/:caregiverId/:postId", deleteCaregiverPost); 
postsRouter.post("/:postId/like", likeCaregiverPost); 
postsRouter.post("/:postId/comment", commentCaregiverPost); 

// Export both routers
export default router;
export { postsRouter };
