import { Router } from "express";
import {
  createNotification,
  getNotificationsByCareseeker,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controller/notificationController";

const router = Router();

router.post("/", createNotification);
router.get("/careseeker/:careseekerId", getNotificationsByCareseeker);
router.put("/:notificationId/read", markNotificationAsRead);
router.put("/careseeker/:careseekerId/read-all", markAllNotificationsAsRead);

export default router;
