// services/bookingNotificationService.ts
import axios from 'axios';

const BOOKING_SERVICE_URL = 'http://192.168.176.11:5002';

export interface BookingNotification {
  id: string;
  type: 'booking_accepted' | 'booking_rejected';
  message: string;
  timestamp: string;
  isRead: boolean;
  booking?: {
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
  };
  caregiver: {
    id: string;
    name: string;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

class BookingNotificationService {
  // Get notifications for a specific careseeker
  async getNotificationsByCareseeker(careseekerId: number): Promise<BookingNotification[]> {
    try {
      console.log('=== BookingNotificationService Debug ===');
      console.log('Fetching notifications for careseeker ID:', careseekerId);
      console.log('Full URL:', `${BOOKING_SERVICE_URL}/notifications/careseeker/${careseekerId}`);
      
      const response = await axios.get(`${BOOKING_SERVICE_URL}/notifications/careseeker/${careseekerId}`);
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching booking notifications:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        console.error('Error response status:', axiosError.response.status);
        console.error('Error response data:', axiosError.response.data);
      }
      throw error;
    }
  }

  // Mark a specific notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await axios.put(`${BOOKING_SERVICE_URL}/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a careseeker
  async markAllNotificationsAsRead(careseekerId: number): Promise<void> {
    try {
      await axios.put(`${BOOKING_SERVICE_URL}/notifications/careseeker/${careseekerId}/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count for a careseeker
  async getUnreadNotificationCount(careseekerId: number): Promise<number> {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/notifications/careseeker/${careseekerId}/unread-count`);
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }
}

export const bookingNotificationService = new BookingNotificationService();
