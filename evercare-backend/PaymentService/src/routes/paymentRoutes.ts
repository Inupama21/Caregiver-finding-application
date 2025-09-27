import express from "express";
import {
  createPayment,
  confirmPaymentWebhook,
  getPayments,
  getPayment,
  updatePayment,
  getPaymentByIntent,
  getAllPayments,
  testConnection
} from "../controllers/paymentController";

const router = express.Router();

// Payment routes
router.post("/create-payment-intent", createPayment);
router.post("/confirm-payment", confirmPaymentWebhook);
router.put("/update-status", updatePayment);
router.get("/test", testConnection);
router.get("/all", getAllPayments);
router.get("/history/:careseekerId", getPayments);
router.get("/intent/:paymentIntentId", getPaymentByIntent);
router.get("/:paymentId", getPayment);

// Note: create-booking route removed - booking creation is handled by frontend calling BookingService

export default router;
