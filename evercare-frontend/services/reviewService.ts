import { API_BASE_URL } from "../app/utils/api";

export interface Review {
  reviewId: number;
  caregiverId: number;
  careseekerId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CaregiverRating {
  caregiverId: number;
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  caregiverId: number;
  careseekerId: number;
  rating: number;
  comment?: string;
}

const REVIEW_SERVICE_URL = "http://192.168.176.11:3004/api";

export const reviewService = {
  // Create or update a review
  createReview: async (
    reviewData: CreateReviewRequest
  ): Promise<{ message: string; review: Review }> => {
    try {
      const response = await fetch(`${REVIEW_SERVICE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Get all reviews for a specific caregiver
  getCaregiverReviews: async (
    caregiverId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/reviews/caregiver/${caregiverId}?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching caregiver reviews:", error);
      throw error;
    }
  },

  // Get average rating for a specific caregiver
  getCaregiverRating: async (caregiverId: number): Promise<CaregiverRating> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/reviews/caregiver/${caregiverId}/rating`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching caregiver rating:", error);
      throw error;
    }
  },

  // Get specific review by caregiver and careseeker IDs
  getReviewByIds: async (
    caregiverId: number,
    careseekerId: number
  ): Promise<{ review: Review } | null> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/reviews/caregiver/${caregiverId}/careseeker/${careseekerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        return null; // Review not found
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (
    caregiverId: number,
    careseekerId: number
  ): Promise<{ message: string }> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/reviews/caregiver/${caregiverId}/careseeker/${careseekerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
