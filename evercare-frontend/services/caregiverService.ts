import { API_BASE_URL } from "../app/utils/api";

export interface CaregiverProfile {
  caregiverId: number;
  displayName?: string | null;
  age?: number | null;
  experienceYears?: number | null;
  specialization?: string | null;
  description?: string | null;
  profilePhoto?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  clientsCount?: number | null;
  completedJobs?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverPost {
  postId: number;
  caregiverId: number;
  text: string;
  image?: string | null;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverProfilesResponse {
  profiles: CaregiverProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const caregiverService = {
  // Get all caregiver profiles
  getAllProfiles: async (
    page: number = 1,
    limit: number = 20
  ): Promise<CaregiverProfilesResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/caregiverProfile?page=${page}&limit=${limit}`,
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
      console.error("Error fetching caregiver profiles:", error);
      throw error;
    }
  },

  // Get specific caregiver profile by ID
  getProfile: async (caregiverId: number): Promise<CaregiverProfile> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/caregiverProfile/${caregiverId}`,
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
      console.error("Error fetching caregiver profile:", error);
      throw error;
    }
  },

  // Get caregiver posts
  getCaregiverPosts: async (
    caregiverId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<CaregiverPost[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/caregiverPosts/${caregiverId}?page=${page}&limit=${limit}`,
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
      console.error("Error fetching caregiver posts:", error);
      throw error;
    }
  },
};
