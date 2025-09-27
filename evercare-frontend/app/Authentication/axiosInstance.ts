// api/axiosInstance.ts

import axios from 'axios';
import { storage } from '../utils/storage';

const API = axios.create({
  baseURL: "http://192.168.176.11:5001", 
});


API.interceptors.request.use(
  async (config) => {
   
        const accessToken = await storage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Handle expired access tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Get refresh token using platform-specific storage
        const refreshToken = await storage.getItem("refreshToken");
        if (refreshToken) {
          // Send request to get a new access token
          const res = await axios.post(`${API.defaults.baseURL}/refresh-token`, { refreshToken });
          const newAccessToken = res.data.accessToken;

        
          await storage.setItem("accessToken", newAccessToken);
          
          // Update the header for the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return API(originalRequest); // Retry the original request
        }
      } catch (refreshError) {
        // If the refresh token is also invalid, log out the user
        await storage.deleteItem("accessToken");
        await storage.deleteItem("refreshToken");
        // Redirect to login screen
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;