import express from "express";
import {
  createBooking,
  getCaregiverBookings,
  updateBookingStatus,
  getAllBookings,
} from "../controller/bookingController";

const router = express.Router();

router.post("/", createBooking);
router.get("/caregiver/:caregiverId", getCaregiverBookings);
router.put("/:bookingId/status", updateBookingStatus);
router.get("/", getAllBookings);

export default router;
