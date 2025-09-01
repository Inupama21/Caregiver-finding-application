import { Request, Response } from "express";
import datasource from "../config/config";
import { Review, ReviewEntity } from "../models/review";
import { Repository } from "typeorm";

export class ReviewController {
  private reviewRepository: Repository<Review>;

  constructor() {
    this.reviewRepository = datasource.getRepository(ReviewEntity);
  }

  // Create or update a review (only careseekers can review)
  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId, careseekerId, rating, comment } = req.body;

      // Validate input
      if (!caregiverId || !careseekerId || !rating) {
        res.status(400).json({
          error: "Missing required fields: caregiverId, careseekerId, rating",
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          error: "Rating must be between 1 and 5",
        });
        return;
      }

      // Check if review already exists
      const existingReview = await this.reviewRepository.findOne({
        where: { caregiverId, careseekerId },
      });

      if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment || "";
        existingReview.updatedAt = new Date();

        const updatedReview = await this.reviewRepository.save(existingReview);
        res.status(200).json({
          message: "Review updated successfully",
          review: updatedReview,
        });
        return;
      }

      // Create new review
      const newReview = this.reviewRepository.create({
        caregiverId,
        careseekerId,
        rating,
        comment: comment || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedReview = await this.reviewRepository.save(newReview);

      res.status(201).json({
        message: "Review created successfully",
        review: savedReview,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all reviews for a specific caregiver
  getCaregiverReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      if (!caregiverId) {
        res.status(400).json({ error: "Caregiver ID is required" });
        return;
      }

      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { caregiverId: parseInt(caregiverId) },
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      });

      res.status(200).json({
        reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching caregiver reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get average rating for a specific caregiver
  getCaregiverRating = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId } = req.params;

      if (!caregiverId) {
        res.status(400).json({ error: "Caregiver ID is required" });
        return;
      }

      const result = await this.reviewRepository
        .createQueryBuilder("review")
        .select("AVG(review.rating)", "averageRating")
        .addSelect("COUNT(review.reviewId)", "totalReviews")
        .where("review.caregiverId = :caregiverId", {
          caregiverId: parseInt(caregiverId),
        })
        .getRawOne();

      const averageRating = result?.averageRating
        ? parseFloat(parseFloat(result.averageRating).toFixed(1))
        : 0;
      const totalReviews = parseInt(result?.totalReviews || "0");

      res.status(200).json({
        caregiverId: parseInt(caregiverId),
        averageRating,
        totalReviews,
      });
    } catch (error) {
      console.error("Error fetching caregiver rating:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get specific review by careseeker and caregiver
  getReviewByIds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId, careseekerId } = req.params;

      if (!caregiverId || !careseekerId) {
        res.status(400).json({
          error: "Both caregiver ID and careseeker ID are required",
        });
        return;
      }

      const review = await this.reviewRepository.findOne({
        where: {
          caregiverId: parseInt(caregiverId),
          careseekerId: parseInt(careseekerId),
        },
      });

      if (!review) {
        res.status(404).json({ message: "Review not found" });
        return;
      }

      res.status(200).json({ review });
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Delete a review (only the careseeker who created it can delete)
  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId, careseekerId } = req.params;

      if (!caregiverId || !careseekerId) {
        res.status(400).json({
          error: "Both caregiver ID and careseeker ID are required",
        });
        return;
      }

      const review = await this.reviewRepository.findOne({
        where: {
          caregiverId: parseInt(caregiverId),
          careseekerId: parseInt(careseekerId),
        },
      });

      if (!review) {
        res.status(404).json({ message: "Review not found" });
        return;
      }

      await this.reviewRepository.remove(review);

      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
