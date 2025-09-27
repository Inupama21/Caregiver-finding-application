// controllers/notificationController.ts
import { Request, Response } from "express";
import dataSource from "../config/config";
import { NotificationEntity } from "../model/notification";
import { BookingEntity } from "../model/booking";

// Create a notification for booking status change
export const createBookingNotification = async (
  bookingId: number,
  type: "booking_accepted" | "booking_rejected" | "payment_completed",
  message: string
): Promise<void> => {
  try {
    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const bookingRepository = dataSource.getRepository(BookingEntity);

    // Get booking details
    const booking = await bookingRepository.findOne({
      where: { bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const notification = notificationRepository.create({
      bookingId,
      careseekerId: booking.careseekerId,
      caregiverId: booking.caregiverId,
      type,
      message,
      isRead: false,
    });

    await notificationRepository.save(notification);
    console.log(`Notification created for booking ${bookingId}: ${type}`);
  } catch (error) {
    console.error("Error creating booking notification:", error);
    throw error;
  }
};

// Create a payment completion notification for caregiver
export const createPaymentCompletionNotification = async (
  bookingId: number,
  careseekerName: string
): Promise<void> => {
  try {
    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const bookingRepository = dataSource.getRepository(BookingEntity);

    // Get booking details
    const booking = await bookingRepository.findOne({
      where: { bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const message = `Great news! ${careseekerName} has completed the payment for booking "${booking.name}". The service can now begin.`;

    const notification = notificationRepository.create({
      bookingId,
      careseekerId: booking.careseekerId,
      caregiverId: booking.caregiverId,
      type: "payment_completed",
      message,
      isRead: false,
    });

    await notificationRepository.save(notification);
    console.log(`Payment completion notification created for booking ${bookingId} to caregiver ${booking.caregiverId}`);
  } catch (error) {
    console.error("Error creating payment completion notification:", error);
    throw error;
  }
};

// Handle payment completion notification request from PaymentService
export const handlePaymentCompletionNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId, caregiverId, message, amount, currency, paymentDate } = req.body;

    if (!bookingId || !caregiverId) {
      res.status(400).json({ message: "Booking ID and caregiver ID are required" });
      return;
    }

    // Get booking details to get careseeker name
    const bookingRepository = dataSource.getRepository(BookingEntity);
    const booking = await bookingRepository.findOne({
      where: { bookingId: parseInt(bookingId) },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Create notification with payment details
    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const notificationMessage = message || `Payment of LKR ${amount || '0'} has been completed for your booking!`;

    const notification = notificationRepository.create({
      bookingId: parseInt(bookingId),
      caregiverId: parseInt(caregiverId),
      careseekerId: booking.careseekerId,
      type: "payment_completed",
      message: notificationMessage,
      isRead: false,
    });

    await notificationRepository.save(notification);
    console.log(`Payment completion notification created for caregiver ${caregiverId}`);

    res.status(200).json({ 
      success: true,
      message: "Payment completion notification created successfully",
      notification: notification
    });
  } catch (error) {
    console.error("Error handling payment completion notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notifications for a specific careseeker
export const getNotificationsByCareseeker = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { careseekerId } = req.params;

    if (!careseekerId || isNaN(Number(careseekerId))) {
      res.status(400).json({ message: "Invalid careseeker ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const bookingRepository = dataSource.getRepository(BookingEntity);

    const notifications = await notificationRepository.find({
      where: { careseekerId: Number(careseekerId) },
      order: { createdAt: "DESC" },
    });

    // Get booking details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const booking = await bookingRepository.findOne({
          where: { bookingId: notification.bookingId },
        });

        return {
          id: notification.notificationId.toString(),
          type: notification.type,
          message: notification.message,
          timestamp: notification.createdAt.toISOString(),
          isRead: notification.isRead,
          booking: booking
            ? {
                id: booking.bookingId.toString(),
                name: booking.name,
                address: booking.address,
                phone: booking.phone,
                startDate: booking.startDate?.toISOString(),
                endDate: booking.endDate?.toISOString(),
                expectedDays: booking.expectedDays,
                patientDescription: booking.patientDescription,
                paymentMethod: booking.paymentMethod,
                caregiverName: booking.caregiverName,
                caregiverRate: booking.caregiverRate,
                status: booking.status,
              }
            : null,
          caregiver: {
            id: notification.caregiverId.toString(),
            name: booking?.caregiverName || "Caregiver",
          },
        };
      })
    );

    res.status(200).json(notificationsWithDetails);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get notifications for a specific caregiver
export const getNotificationsByCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { caregiverId } = req.params;

    if (!caregiverId || isNaN(Number(caregiverId))) {
      res.status(400).json({ message: "Invalid caregiver ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const bookingRepository = dataSource.getRepository(BookingEntity);

    const notifications = await notificationRepository.find({
      where: { caregiverId: Number(caregiverId) },
      order: { createdAt: "DESC" },
    });

    // Get booking details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const booking = await bookingRepository.findOne({
          where: { bookingId: notification.bookingId },
        });

        return {
          id: notification.notificationId.toString(),
          type: notification.type,
          message: notification.message,
          timestamp: notification.createdAt.toISOString(),
          isRead: notification.isRead,
          booking: booking
            ? {
                id: booking.bookingId.toString(),
                name: booking.name,
                address: booking.address,
                phone: booking.phone,
                startDate: booking.startDate?.toISOString(),
                endDate: booking.endDate?.toISOString(),
                expectedDays: booking.expectedDays,
                patientDescription: booking.patientDescription,
                paymentMethod: booking.paymentMethod,
                caregiverName: booking.caregiverName,
                caregiverRate: booking.caregiverRate,
                status: booking.status,
              }
            : null,
          careseeker: {
            id: notification.careseekerId.toString(),
            name: "Careseeker", // You might want to get this from a user service
          },
        };
      })
    );

    res.status(200).json(notificationsWithDetails);
  } catch (error) {
    console.error("Error fetching caregiver notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notification count for a caregiver
export const getUnreadNotificationCountForCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { caregiverId } = req.params;

    if (!caregiverId || isNaN(Number(caregiverId))) {
      res.status(400).json({ message: "Invalid caregiver ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const count = await notificationRepository.count({
      where: { caregiverId: Number(caregiverId), isRead: false },
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread notification count for caregiver:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { notificationId } = req.params;

    if (!notificationId || isNaN(Number(notificationId))) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const notification = await notificationRepository.findOne({
      where: { notificationId: Number(notificationId) },
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    notification.isRead = true;
    await notificationRepository.save(notification);

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all notifications as read for a careseeker
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { careseekerId } = req.params;

    if (!careseekerId || isNaN(Number(careseekerId))) {
      res.status(400).json({ message: "Invalid careseeker ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    await notificationRepository.update(
      { careseekerId: Number(careseekerId), isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notification count for a careseeker
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { careseekerId } = req.params;

    if (!careseekerId || isNaN(Number(careseekerId))) {
      res.status(400).json({ message: "Invalid careseeker ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const count = await notificationRepository.count({
      where: { careseekerId: Number(careseekerId), isRead: false },
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all notifications as read for a caregiver
export const markAllNotificationsAsReadForCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { caregiverId } = req.params;

    if (!caregiverId || isNaN(Number(caregiverId))) {
      res.status(400).json({ message: "Invalid caregiver ID" });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    await notificationRepository.update(
      { caregiverId: Number(caregiverId), isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "All notifications marked as read for caregiver" 
    });
  } catch (error) {
    console.error("Error marking all notifications as read for caregiver:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
