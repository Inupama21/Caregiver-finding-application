import { Router } from "express";
import { ReviewController } from "../controller/reviewController";

const router = Router();
const reviewController = new ReviewController();

// Create or update a review
router.post("/reviews", reviewController.createReview);

// Get all reviews for a caregiver
router.get(
  "/reviews/caregiver/:caregiverId",
  reviewController.getCaregiverReviews
);

// Get average rating for a caregiver
router.get(
  "/reviews/caregiver/:caregiverId/rating",
  reviewController.getCaregiverRating
);

// Get specific review by caregiver and careseeker IDs
router.get(
  "/reviews/caregiver/:caregiverId/careseeker/:careseekerId",
  reviewController.getReviewByIds
);

// Delete a review
router.delete(
  "/reviews/caregiver/:caregiverId/careseeker/:careseekerId",
  reviewController.deleteReview
);

export default router;
