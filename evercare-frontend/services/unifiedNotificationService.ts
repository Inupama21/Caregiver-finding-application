// services/unifiedNotificationService.ts
import axios from 'axios';
import { bookingNotificationService, BookingNotification } from './bookingNotificationService';

const JOB_POSTING_SERVICE_URL = 'http://192.168.176.11:5003';
const BOOKING_SERVICE_URL = 'http://192.168.176.11:5002';

export interface InterestNotification {
  id: string;
  type: 'interest';
  message: string;
  timestamp: string;
  isRead: boolean;
  caregiver: {
    id: string;
    name: string;
    specialization: string;
    experience: string;
    rating: number;
    rate: number;
    location: string;
    description: string;
    skills: string[];
    availability: string;
  };
  post: {
    id: string;
    title: string;
    patientAge: number;
    careType: string;
    description: string;
    budget: number;
    location: string;
    timePosted: string;
  };
}

export type UnifiedNotification = BookingNotification | InterestNotification;

export interface UnreadCountResponse {
  unreadCount: number;
}

class UnifiedNotificationService {
  // Get all notifications for a specific careseeker from both services
  async getNotificationsByCareseeker(careseekerId: number): Promise<UnifiedNotification[]> {
    try {
      console.log('=== UnifiedNotificationService Debug ===');
      console.log('Fetching notifications for careseeker ID:', careseekerId);
      
      // Fetch from both services in parallel
      const [bookingNotifications, interestNotifications] = await Promise.all([
        this.getBookingNotifications(careseekerId),
        this.getInterestNotifications(careseekerId)
      ]);
      
      // Combine and sort by timestamp (newest first)
      const allNotifications = [...bookingNotifications, ...interestNotifications];
      allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      console.log('Combined notifications:', allNotifications);
      return allNotifications;
    } catch (error) {
      console.error('Error fetching unified notifications:', error);
      throw error;
    }
  }

  // Get booking notifications from BookingService
  private async getBookingNotifications(careseekerId: number): Promise<BookingNotification[]> {
    try {
      console.log('Fetching booking notifications from BookingService...');
      return await bookingNotificationService.getNotificationsByCareseeker(careseekerId);
    } catch (error) {
      console.error('Error fetching booking notifications:', error);
      return []; // Return empty array if booking service fails
    }
  }

  // Get interest notifications from JobPostingService
  private async getInterestNotifications(careseekerId: number): Promise<InterestNotification[]> {
    try {
      console.log('Fetching interest notifications from JobPostingService...');
      const response = await axios.get(`${JOB_POSTING_SERVICE_URL}/notifications/careseeker/${careseekerId}`);
      console.log('Interest notifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching interest notifications:', error);
      return []; // Return empty array if job posting service fails
    }
  }

  // Get total unread count from both services
  async getUnreadNotificationCount(careseekerId: number): Promise<number> {
    try {
      console.log('Fetching unread count for careseeker ID:', careseekerId);
      
      const [bookingUnreadCount, interestUnreadCount] = await Promise.all([
        this.getBookingUnreadCount(careseekerId),
        this.getInterestUnreadCount(careseekerId)
      ]);
      
      const totalUnreadCount = bookingUnreadCount + interestUnreadCount;
      console.log('Total unread count:', totalUnreadCount);
      return totalUnreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Get unread count from BookingService
  private async getBookingUnreadCount(careseekerId: number): Promise<number> {
    try {
      const response = await bookingNotificationService.getUnreadNotificationCount(careseekerId);
      return response;
    } catch (error) {
      console.error('Error fetching booking unread count:', error);
      return 0;
    }
  }

  // Get unread count from JobPostingService (assuming it returns notifications with isRead field)
  private async getInterestUnreadCount(careseekerId: number): Promise<number> {
    try {
      const notifications = await this.getInterestNotifications(careseekerId);
      return notifications.filter(notification => !notification.isRead).length;
    } catch (error) {
      console.error('Error fetching interest unread count:', error);
      return 0;
    }
  }

  // Mark a specific notification as read
  async markNotificationAsRead(notificationId: string, notificationType: 'booking' | 'interest'): Promise<void> {
    try {
      if (notificationType === 'booking') {
        await bookingNotificationService.markNotificationAsRead(notificationId);
      } else {
        // Mark interest notification as read
        await axios.put(`${JOB_POSTING_SERVICE_URL}/notifications/${notificationId}/read`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(careseekerId: number): Promise<void> {
    try {
      await Promise.all([
        bookingNotificationService.markAllNotificationsAsRead(careseekerId),
        axios.put(`${JOB_POSTING_SERVICE_URL}/notifications/careseeker/${careseekerId}/read-all`)
      ]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();
