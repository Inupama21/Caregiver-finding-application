import { Request, Response } from "express";
import { createPaymentIntent, confirmPayment, getPaymentHistory, getPaymentById, updatePaymentStatus, getPaymentByIntentId } from "../services/paymentService";
import datasource from "../config/database";
import { PaymentEntity } from "../models/Payment";

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, careseekerId, caregiverId, bookingId, description, metadata } = req.body;

    if (!amount || !careseekerId || !caregiverId) {
      res.status(400).json({ 
        success: false, 
        message: "Amount, careseekerId, and caregiverId are required" 
      });
      return;
    }

    const paymentData = {
      amount: parseFloat(amount),
      currency: currency || 'lkr',
      careseekerId: parseInt(careseekerId),
      caregiverId: parseInt(caregiverId),
      bookingId: bookingId ? parseInt(bookingId) : undefined,
      description,
      metadata
    };

    const result = await createPaymentIntent(paymentData);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in createPayment:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const confirmPaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        message: "Payment intent ID is required"
      });
      return;
    }

    const payment = await confirmPayment(paymentIntentId);

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error in confirmPaymentWebhook:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const careseekerId = parseInt(req.params.careseekerId, 10);

    // ✅ FIX: Validate that the parsed ID is a valid number
    if (isNaN(careseekerId)) {
      res.status(400).json({
        success: false,
        message: "A valid numeric Careseeker ID is required.",
      });
      return;
    }

    const payments = await getPaymentHistory(careseekerId);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error in getPayments:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: I've changed req.params.paymentId to req.params.id to match the common convention
    // If your route is defined as '/payments/:paymentId', you can change this back.
    const paymentId = parseInt(req.params.id, 10);

    // ✅ FIX: Validate that the parsed ID is a valid number
    if (isNaN(paymentId)) {
      res.status(400).json({
        success: false,
        message: "A valid numeric Payment ID is required.",
      });
      return;
    }

    const payment = await getPaymentById(paymentId);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error in getPayment:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId, status } = req.body;

    if (!paymentIntentId || !status) {
      res.status(400).json({
        success: false,
        message: "Payment intent ID and status are required"
      });
      return;
    }

    const updatedPayment = await updatePaymentStatus(paymentIntentId, status);

    if (!updatedPayment) {
      res.status(404).json({
        success: false,
        message: "Payment not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    console.error('Error in updatePayment:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getPaymentByIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
      return;
    }

    const payment = await getPaymentByIntentId(paymentIntentId);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Error in getPaymentByIntent:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all payments...');
    
    if (!datasource.isInitialized) {
      console.log('Datasource not initialized, initializing...');
      await datasource.initialize();
    }
    
    const paymentRepository = datasource.getRepository(PaymentEntity);
    console.log('Repository created, fetching payments...');
    
    const payments = await paymentRepository.find({
      order: { createdAt: 'DESC' },
    });

    console.log(`Found ${payments.length} payments`);
    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Test endpoint to check database connection
export const testConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing database connection...');
    
    // Check if datasource is initialized
    if (!datasource.isInitialized) {
      console.log('Datasource not initialized, initializing...');
      await datasource.initialize();
    }
    
    const paymentRepository = datasource.getRepository(PaymentEntity);
    const count = await paymentRepository.count();
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      paymentCount: count
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Note: createBookingPayment function removed
// Booking creation is now handled by the frontend calling BookingService directly
// PaymentService only handles payment-related operations
