import { Stripe } from "stripe";
import axios from "axios";
import datasource from "../config/database";
import { Payment, PaymentEntity } from "../models/Payment";

const BOOKING_SERVICE_URL = "http://192.168.176.11:5002";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// Helper function to send payment completion notification to caregiver
const sendPaymentCompletionNotification = async (payment: Payment) => {
  try {
    if (!payment.caregiverId || !payment.bookingId) {
      console.log("Missing caregiverId or bookingId, skipping notification");
      return;
    }

    const message = `Payment of LKR ${payment.amount} has been completed for your booking!`;

    await axios.post(
      `${BOOKING_SERVICE_URL}/notifications/payment-completion`,
      {
        bookingId: payment.bookingId,
        caregiverId: payment.caregiverId,
        message: message,
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.updatedAt,
      }
    );

    console.log(
      `Payment completion notification sent to caregiver ${payment.caregiverId}`
    );
  } catch (error) {
    console.error("Error sending payment completion notification:", error);
    // Don't throw error to avoid breaking payment flow
  }
};

const paymentRepository = datasource.getRepository(PaymentEntity);

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  careseekerId: number;
  caregiverId: number;
  bookingId?: number;
  description?: string;
  metadata?: any;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

export const createPaymentIntent = async (
  data: CreatePaymentIntentData
): Promise<PaymentIntentResponse> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || "lkr",
      metadata: {
        careseekerId: data.careseekerId.toString(),
        caregiverId: data.caregiverId.toString(),
        bookingId: data.bookingId?.toString() || "",
        description: data.description || "",
        ...data.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save payment record to database with pending status
    const payment = paymentRepository.create({
      paymentIntentId: paymentIntent.id,
      amount: data.amount,
      currency: data.currency || "lkr",
      status: "pending",
      careseekerId: data.careseekerId,
      caregiverId: data.caregiverId,
      bookingId: data.bookingId,
      description: data.description,
      metadata: {
        careseekerId: data.careseekerId.toString(),
        caregiverId: data.caregiverId.toString(),
        bookingId: data.bookingId?.toString() || "",
        description: data.description || "",
        ...data.metadata,
      },
    });

    await paymentRepository.save(payment);
    console.log("Payment record created with pending status:", payment.id);

    return {
      clientSecret: paymentIntent.client_secret!,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

export const confirmPayment = async (
  paymentIntentId: string
): Promise<Payment> => {
  try {
    // Retrieve payment intent from Stripe
    const stripePaymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    // Find existing payment record
    const existingPayment = await paymentRepository.findOne({
      where: { paymentIntentId: paymentIntentId },
    });

    if (!existingPayment) {
      throw new Error("Payment record not found");
    }

    // Update existing payment record with new status and any additional data from Stripe
    existingPayment.status = stripePaymentIntent.status;
    existingPayment.amount = stripePaymentIntent.amount / 100; // Convert from cents
    existingPayment.currency = stripePaymentIntent.currency;
    existingPayment.updatedAt = new Date();

    const updatedPayment = await paymentRepository.save(existingPayment);
    console.log(
      "Payment record updated with status:",
      stripePaymentIntent.status,
      "for payment ID:",
      updatedPayment.id
    );

    // Send notification to caregiver if payment is successful
    if (stripePaymentIntent.status === "succeeded") {
      await sendPaymentCompletionNotification(updatedPayment);
    }

    // Note: Booking status updates should be handled by BookingService
    // The PaymentService only manages payment-related data

    return updatedPayment;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw new Error("Failed to confirm payment");
  }
};

export const getPaymentHistory = async (
  careseekerId: number
): Promise<Payment[]> => {
  try {
    return await paymentRepository.find({
      where: { careseekerId },
      order: { createdAt: "DESC" },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw new Error("Failed to fetch payment history");
  }
};

export const getPaymentById = async (
  paymentId: number
): Promise<Payment | null> => {
  try {
    return await paymentRepository.findOne({
      where: { id: paymentId },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error("Failed to fetch payment");
  }
};

export const updatePaymentStatus = async (
  paymentIntentId: string,
  status: string
): Promise<Payment | null> => {
  try {
    // Find existing payment record
    const existingPayment = await paymentRepository.findOne({
      where: { paymentIntentId: paymentIntentId },
    });

    if (!existingPayment) {
      console.warn(
        "Payment record not found for paymentIntentId:",
        paymentIntentId
      );
      return null;
    }

    // Update payment status
    existingPayment.status = status;
    existingPayment.updatedAt = new Date();

    const updatedPayment = await paymentRepository.save(existingPayment);
    console.log(
      "Payment status updated to:",
      status,
      "for payment ID:",
      updatedPayment.id
    );

    return updatedPayment;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Failed to update payment status");
  }
};

export const getPaymentByIntentId = async (
  paymentIntentId: string
): Promise<Payment | null> => {
  try {
    return await paymentRepository.findOne({
      where: { paymentIntentId: paymentIntentId },
    });
  } catch (error) {
    console.error("Error fetching payment by intent ID:", error);
    throw new Error("Failed to fetch payment by intent ID");
  }
};

// Note: Booking creation is handled by the frontend calling BookingService directly
// PaymentService only handles payment-related operations
