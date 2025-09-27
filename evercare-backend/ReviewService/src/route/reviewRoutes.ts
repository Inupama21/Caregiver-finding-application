import { Router } from "express";
import { ReviewController } from "../controller/reviewController";

const router = Router();
const reviewController = new ReviewController();


router.post("/reviews", reviewController.createReview);


router.get(
  "/reviews/caregiver/:caregiverId",
  reviewController.getCaregiverReviews
);


router.get(
  "/reviews/caregiver/:caregiverId/rating",
  reviewController.getCaregiverRating
);


router.get(
  "/reviews/caregiver/:caregiverId/careseeker/:careseekerId",
  reviewController.getReviewByIds
);


router.delete(
  "/reviews/caregiver/:caregiverId/careseeker/:careseekerId",
  reviewController.deleteReview
);

export default router;
