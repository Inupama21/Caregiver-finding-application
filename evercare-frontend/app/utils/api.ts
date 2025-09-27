// API configuration
export const API_BASE_URL = "http://192.168.176.11:5001";

// Service URLs
export const USER_SERVICE_URL = "http://192.168.176.11:5001";
export const CHAT_SERVICE_URL = "http://192.168.176.11:5004";
export const BOOKING_SERVICE_URL = "http://192.168.176.11:5002";
export const JOB_POSTING_SERVICE_URL = "http://192.168.176.11:5003";

// Common API utilities
export const apiConfig = {
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};
