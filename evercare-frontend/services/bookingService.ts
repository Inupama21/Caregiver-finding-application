export interface Booking {
  bookingId: number;
  caregiverId: number;
  careseekerId: number;
  name: string;
  address: string;
  phone: string;
  startDate: string;
  endDate: string;
  expectedDays: string;
  patientDescription: string;
  paymentMethod: string;
  caregiverName: string;
  caregiverRate: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  caregiverId: number;
  careseekerId: number;
  name: string;
  address: string;
  phone: string;
  startDate: string;
  endDate: string;
  expectedDays: string;
  patientDescription: string;
  paymentMethod: string;
  caregiverName: string;
  caregiverRate: string;
}

const BOOKING_API_URL = "http://192.168.176.11:5002";

export const bookingService = {
  // Create a new booking
  createBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<Booking> => {
    try {
      const response = await fetch(`${BOOKING_API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.booking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Get bookings for a specific caregiver
  getCaregiverBookings: async (caregiverId: number): Promise<Booking[]> => {
    try {
      const response = await fetch(
        `${BOOKING_API_URL}/bookings/caregiver/${caregiverId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.bookings;
    } catch (error) {
      console.error("Error fetching caregiver bookings:", error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (
    bookingId: number,
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  ): Promise<Booking> => {
    try {
      const response = await fetch(
        `${BOOKING_API_URL}/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.booking;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },

  // Get all bookings
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const response = await fetch(`${BOOKING_API_URL}/bookings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.bookings;
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      throw error;
    }
  },
};
