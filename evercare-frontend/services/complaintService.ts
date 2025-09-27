import { API_BASE_URL } from "../app/utils/api";

export interface Complaint {
  complaintId: number;
  caregiverId: number;
  careseekerId: number;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateComplaintRequest {
  caregiverId: number;
  careseekerId: number;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateComplaintStatusRequest {
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
}

const REVIEW_SERVICE_URL = "http://192.168.176.11:3004/api";

export const complaintService = {
  // Create a new complaint
  createComplaint: async (
    complaintData: CreateComplaintRequest
  ): Promise<{ message: string; complaint: Complaint }> => {
    try {
      const response = await fetch(`${REVIEW_SERVICE_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
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
      console.error("Error creating complaint:", error);
      throw error;
    }
  },

  // Get all complaints for a specific careseeker
  getCareseekerComplaints: async (
    careseekerId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ComplaintsResponse> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints/careseeker/${careseekerId}?page=${page}&limit=${limit}`,
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
      console.error("Error fetching careseeker complaints:", error);
      throw error;
    }
  },

  // Get all complaints for a specific caregiver
  getCaregiverComplaints: async (
    caregiverId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ComplaintsResponse> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints/caregiver/${caregiverId}?page=${page}&limit=${limit}`,
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
      console.error("Error fetching caregiver complaints:", error);
      throw error;
    }
  },

  // Get all complaints (for admin)
  getAllComplaints: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ComplaintsResponse> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints?page=${page}&limit=${limit}`,
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
      console.error("Error fetching all complaints:", error);
      throw error;
    }
  },

  // Get specific complaint by ID
  getComplaintById: async (complaintId: number): Promise<{ complaint: Complaint }> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints/${complaintId}`,
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
      console.error("Error fetching complaint:", error);
      throw error;
    }
  },

  // Update complaint status (admin only)
  updateComplaintStatus: async (
    complaintId: number,
    statusData: UpdateComplaintStatusRequest
  ): Promise<{ message: string; complaint: Complaint }> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints/${complaintId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusData),
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
      console.error("Error updating complaint status:", error);
      throw error;
    }
  },

  // Delete a complaint
  deleteComplaint: async (complaintId: number): Promise<{ message: string }> => {
    try {
      const response = await fetch(
        `${REVIEW_SERVICE_URL}/complaints/${complaintId}`,
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
      console.error("Error deleting complaint:", error);
      throw error;
    }
  },
};
