import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.176.11:3002";

class AuthStorage {
  //  Save token
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem("authToken", token);
  }

  //  Get token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem("authToken");
  }

  //  Clear token (logout)
  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("currentUser");
  }

  //  Save user details
  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  }

  // Get user details
  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  // Decode JWT token to get user info (alternative to stored user)
  decodeToken(token: string): any | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Get current user info from token
  async getCurrentUser(): Promise<any | null> {
    const token = await this.getToken();
    if (!token) return null;

    // Try stored user first
    const storedUser = await this.getUser();
    if (storedUser) return storedUser;

    // Fallback to token decode
    return this.decodeToken(token);
  }

  //  Make an authenticated API call
  async makeAuthenticatedRequest(
    endpoint: string,
    method: string = "GET",
    data?: any
  ) {
    const token = await this.getToken();
    if (!token)
      throw new Error("No authentication token found. Please login again.");

    const config: any = {
      method: method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.data = data;
    }

    return axios(config);
  }

  // Login method
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/api/careseekers/login`, {
        email,
        password,
      });

      if (response.data.token) {
        await this.saveToken(response.data.token);
        if (response.data.user) {
          await this.saveUser(response.data.user);
        }
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  // Logout method
  async logout(): Promise<void> {
    await this.clearToken();
  }
}

export default new AuthStorage();
