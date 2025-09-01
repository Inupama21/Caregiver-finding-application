import { Router } from "express";
import {
  createNotification,
  getNotificationsByCareseeker,
} from "../controller/notificationController";

const router = Router();

router.post("/", createNotification);
router.get("/careseeker/:careseekerId", getNotificationsByCareseeker);

export default router;
