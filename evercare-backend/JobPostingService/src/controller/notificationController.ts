// controllers/notificationController.ts
import { Request, Response } from "express";
import axios from "axios";
import dataSource from "../config/config";
import { NotificationEntity } from "../models/notifications";
import { PostEntity } from "../models/post";

const USER_SERVICE_URL = "http://192.168.176.11:5001";

// Helper function to fetch caregiver data from UserService
const fetchCaregiverData = async (caregiverId: number) => {
  try {
    const [caregiverResponse, profileResponse] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/caregiver/${caregiverId}`),
      axios.get(`${USER_SERVICE_URL}/caregiverProfile/${caregiverId}`)
    ]);

    const caregiver = caregiverResponse.data.user || caregiverResponse.data;
    const profile = profileResponse.data;

    return {
      id: caregiver.caregiverId.toString(),
      name: caregiver.caregiverName || profile.displayName || "Caregiver",
      specialization: profile.specialization || "General Care",
      experience: profile.experienceYears ? `${profile.experienceYears}+ years` : "2+ years",
      rating: profile.averageRating || 4.5,
      rate: 15, // Default rate, can be updated later
      location: caregiver.district || "Unknown",
      description: profile.description || "Experienced caregiver",
      skills: ["Patient Care", "Medication Management"], // Default skills
      availability: "Available",
      profilePhoto: caregiver.caregiverPhoto || profile.profilePhoto,
    };
  } catch (error) {
    console.error("Error fetching caregiver data:", error);
    // Return default data if fetch fails
    return {
      id: caregiverId.toString(),
      name: "Caregiver",
      specialization: "General Care",
      experience: "2+ years",
      rating: 4.5,
      rate: 15,
      location: "Unknown",
      description: "Experienced caregiver",
      skills: ["Patient Care", "Medication Management"],
      availability: "Available",
    };
  }
};

export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId, caregiverId, careseekerId } = req.body;

  console.log("=== Creating Notification ===");
  console.log("Request body:", req.body);
  console.log("postId:", postId, "type:", typeof postId);
  console.log("caregiverId:", caregiverId, "type:", typeof caregiverId);
  console.log("careseekerId:", careseekerId, "type:", typeof careseekerId);

  try {
    if (!postId || !caregiverId || !careseekerId) {
      console.log(" Missing required fields");
      res.status(400).json({
        message: "Missing required fields: postId, caregiverId, careseekerId",
      });
      return;
    }

    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const notification = notificationRepository.create({
      type: "interest",
      postId: parseInt(postId),
      caregiverId: parseInt(caregiverId),
      careseekerId: parseInt(careseekerId),
      message: "A caregiver is interested in your post!",
    });

    console.log("Created notification object:", notification);

    const savedNotification = await notificationRepository.save(notification);
    console.log(" Saved notification:", savedNotification);

    res.status(201).json({ success: true, notification: savedNotification });
  } catch (error) {
    console.error(" Error creating notification:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ message: "Internal server error", error: errorMessage });
  }
};

export const getNotificationsByCareseeker = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { careseekerId } = req.params;
  try {
    const notificationRepository = dataSource.getRepository(NotificationEntity);
    const postRepository = dataSource.getRepository(PostEntity);

    const notifications = await notificationRepository.find({
      where: { careseekerId: parseInt(careseekerId) },
      order: { createdAt: "DESC" },
    });

    // Get post details and caregiver data for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const [post, caregiverData] = await Promise.all([
          postRepository.findOne({
            where: { postId: notification.postId },
          }),
          fetchCaregiverData(notification.caregiverId)
        ]);

        return {
          id: notification.notificationId.toString(),
          type: notification.type,
          message: notification.message,
          timestamp: notification.createdAt.toISOString(),
          isRead: notification.isRead,
          caregiver: caregiverData,
          post: post
            ? {
                id: post.postId.toString(),
                title: `Care for ${post.age} year old`,
                patientAge: post.age,
                careType: post.careType,
                description: post.description,
                budget: 100,
                location: post.district,
                timePosted: "Recently",
              }
            : null,
        };
      })
    );

    res.status(200).json(notificationsWithDetails);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { notificationId } = req.params;

  try {
    const notificationRepository = dataSource.getRepository(NotificationEntity);

    const notification = await notificationRepository.findOne({
      where: { notificationId: parseInt(notificationId) },
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    notification.isRead = true;
    await notificationRepository.save(notification);

    res.status(200).json({ success: true, message: "Notification marked as read" });
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
  const { careseekerId } = req.params;

  try {
    const notificationRepository = dataSource.getRepository(NotificationEntity);

    await notificationRepository.update(
      { careseekerId: parseInt(careseekerId), isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
