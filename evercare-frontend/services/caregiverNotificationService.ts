export interface CaregiverNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  booking: {
    id: string;
    name: string;
    address: string;
    phone: string;
    startDate: string;
    endDate: string;
    expectedDays: string;
    patientDescription: string;
    paymentMethod: string;
    caregiverName: string;
    caregiverRate: string;
    status: string;
  } | null;
  careseeker: {
    id: string;
    name: string;
  };
}

const NOTIFICATION_API_URL = "http://192.168.176.11:5002";

export const caregiverNotificationService = {
  // Get notifications for a specific caregiver
  getNotifications: async (caregiverId: number): Promise<CaregiverNotification[]> => {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/notifications/caregiver/${caregiverId}`,
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
      console.error("Error fetching caregiver notifications:", error);
      throw error;
    }
  },

  // Get unread notification count for a caregiver
  getUnreadCount: async (caregiverId: number): Promise<number> => {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/notifications/caregiver/${caregiverId}/unread-count`,
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
      return data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Mark all notifications as read for a caregiver
  markAllAsRead: async (caregiverId: number): Promise<void> => {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/notifications/caregiver/${caregiverId}/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};
