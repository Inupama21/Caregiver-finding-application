import { Router } from "express";
import {
  getNotificationsByCareseeker,
  getNotificationsByCaregiver,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markAllNotificationsAsReadForCaregiver,
  getUnreadNotificationCount,
  getUnreadNotificationCountForCaregiver,
  handlePaymentCompletionNotification,
} from "../controller/notificationController";

const router = Router();

router.get("/careseeker/:careseekerId", getNotificationsByCareseeker);


router.get("/caregiver/:caregiverId", getNotificationsByCaregiver);


router.put("/:notificationId/read", markNotificationAsRead);


router.put("/careseeker/:careseekerId/read-all", markAllNotificationsAsRead);

router.put("/caregiver/:caregiverId/read-all", markAllNotificationsAsReadForCaregiver);

router.get("/careseeker/:careseekerId/unread-count", getUnreadNotificationCount);


router.get("/caregiver/:caregiverId/unread-count", getUnreadNotificationCountForCaregiver);


router.post("/payment-completion", handlePaymentCompletionNotification);

export default router;
