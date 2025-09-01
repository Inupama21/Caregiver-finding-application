// controllers/notificationController.ts
import { Request, Response } from "express";
import dataSource from "../config/config";
import { NotificationEntity } from "../models/notifications";
import { PostEntity } from "../models/post";

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

    // Get post details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const post = await postRepository.findOne({
          where: { postId: notification.postId },
        });

        return {
          id: notification.notificationId.toString(),
          type: notification.type,
          message: notification.message,
          timestamp: notification.createdAt.toISOString(),
          isRead: false, // You can add this field to the notification model later
          caregiver: {
            id: notification.caregiverId.toString(),
            name: "Caregiver",
            specialization: "General Care",
            experience: "2+ years",
            rating: 4.5,
            rate: 15,
            location: "Unknown",
            description: "Experienced caregiver",
            skills: ["Patient Care", "Medication Management"],
            availability: "Available",
          },
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
