import axios from 'axios';

// Separate API URLs for different services
const PAYMENT_API_BASE_URL = 'http://192.168.176.11:5005/api/payments';
const BOOKING_API_BASE_URL = 'http://192.168.176.11:5002/bookings';


export interface PaymentIntentData {
  amount: number;
  currency?: string;
  careseekerId: number;
  caregiverId: number;
  bookingId?: number;
  description?: string;
  metadata?: any;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    publishableKey: string;
  };
}

export interface BookingPaymentData {
  careseekerId: number;
  caregiverId: number;
  serviceType?: string;
  amount: number;
  startDate: string;
  endDate: string;
  description?: string;
  address?: string;
  phone?: string;
  name?: string;
}

export interface BookingPaymentResponse {
  success: boolean;
  data: {
    booking: any;
    paymentIntent: {
      clientSecret: string;
      publishableKey: string;
    };
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: any[];
}

export const createPaymentIntent = async (data: PaymentIntentData): Promise<PaymentIntentResponse> => {
  try {
    const response = await axios.post(`${PAYMENT_API_BASE_URL}/create-payment-intent`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
};

export const confirmPayment = async (paymentIntentId: string): Promise<any> => {
  try {
    const response = await axios.post(`${PAYMENT_API_BASE_URL}/confirm-payment`, {
      paymentIntentId
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error('Failed to confirm payment');
  }
};

export const createBookingPayment = async (data: BookingPaymentData): Promise<BookingPaymentResponse> => {
  try {
    // Validate required fields
    if (!data.caregiverId || !data.careseekerId || !data.name || !data.address || !data.phone) {
      throw new Error('Missing required fields: caregiverId, careseekerId, name, address, and phone are required');
    }

    // First create booking with BookingService
    const bookingResponse = await axios.post(`${BOOKING_API_BASE_URL}`, {
      caregiverId: data.caregiverId,
      careseekerId: data.careseekerId,
      name: data.name,
      address: data.address,
      phone: data.phone,
      startDate: data.startDate,
      endDate: data.endDate,
      expectedDays: '1 week', // Default value
      patientDescription: data.description || 'Care service booking',
      paymentMethod: 'Credit Card', // Default value
      caregiverName: 'Caregiver', // This should be passed from frontend
      caregiverRate: `LKR ${data.amount}/hr`,
    });

    if (!bookingResponse.data.booking) {
      throw new Error('Failed to create booking');
    }

    const booking = bookingResponse.data.booking;

    // Then create payment intent with PaymentService
    const paymentResponse = await axios.post(`${PAYMENT_API_BASE_URL}/create-payment-intent`, {
      amount: data.amount,
      currency: 'usd',
      careseekerId: data.careseekerId,
      caregiverId: data.caregiverId,
      bookingId: booking.bookingId,
      description: data.description,
      metadata: {
        bookingId: booking.bookingId,
        caregiverId: data.caregiverId,
        careseekerId: data.careseekerId,
        description: data.description,
      }
    });

    return {
      success: true,
      data: {
        booking: booking,
        paymentIntent: paymentResponse.data.data
      }
    };
  } catch (error) {
    console.error('Error creating booking payment:', error);
    throw new Error('Failed to create booking payment');
  }
};

export const getPaymentHistory = async (careseekerId: number): Promise<PaymentHistoryResponse> => {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/history/${careseekerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Failed to fetch payment history');
  }
};

export const getPayment = async (paymentId: number): Promise<any> => {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error('Failed to fetch payment');
  }
};

export const updatePaymentStatus = async (paymentIntentId: string, status: string): Promise<any> => {
  try {
    const response = await axios.put(`${PAYMENT_API_BASE_URL}/update-status`, {
      paymentIntentId,
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

export const getPaymentByIntentId = async (paymentIntentId: string): Promise<any> => {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/intent/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment by intent ID:', error);
    throw new Error('Failed to fetch payment by intent ID');
  }
};

export const getAllPayments = async (): Promise<any> => {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw new Error('Failed to fetch all payments');
  }
};