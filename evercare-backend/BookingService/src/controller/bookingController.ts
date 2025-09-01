import { Request, Response } from "express";
import dataSource from "../config/config";
import { Booking, BookingEntity } from "../model/booking";

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      caregiverId,
      careseekerId,
      name,
      address,
      phone,
      startDate,
      endDate,
      expectedDays,
      patientDescription,
      paymentMethod,
      caregiverName,
      caregiverRate,
    } = req.body;

    if (
      !caregiverId ||
      !careseekerId ||
      !name ||
      !address ||
      !phone ||
      !startDate ||
      !endDate ||
      !expectedDays ||
      !patientDescription ||
      !paymentMethod
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const bookingRepo = dataSource.getRepository(BookingEntity);

    const newBooking = bookingRepo.create({
      caregiverId,
      careseekerId,
      name,
      address,
      phone,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      expectedDays,
      patientDescription,
      paymentMethod,
      caregiverName,
      caregiverRate,
      status: "pending",
    });

    await bookingRepo.save(newBooking);

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Get bookings for a specific caregiver
export const getCaregiverBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ message: "Invalid caregiver ID" });
      return;
    }

    const bookingRepo = dataSource.getRepository(BookingEntity);

    const bookings = await bookingRepo.find({
      where: { caregiverId },
      order: { startDate: "ASC" },
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching caregiver bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update booking status (accept/reject)
export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body;

    if (!bookingId || isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    if (
      !["pending", "accepted", "rejected", "completed", "cancelled"].includes(
        status
      )
    ) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const bookingRepo = dataSource.getRepository(BookingEntity);

    const booking = await bookingRepo.findOne({
      where: { bookingId },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    booking.status = status;
    await bookingRepo.save(booking);

    res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all bookings (for admin or general purposes)
export const getAllBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookingRepo = dataSource.getRepository(BookingEntity);

    const bookings = await bookingRepo.find({
      order: { createdAt: "DESC" },
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
