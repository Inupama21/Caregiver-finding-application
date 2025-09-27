import axios from "axios";
import { CHAT_SERVICE_URL } from "../app/utils/api";

const API_BASE_URL = CHAT_SERVICE_URL;

// This interface should match the one in socketService for consistency
export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface GetMessagesRequest {
  user1: number;
  user2: number;
}

export interface MarkAsReadRequest {
    readerId: number;
    senderId: number;
}

// ... (ChatConversation interface can stay the same)

class ChatService {
  // Get chat history between two users (still needed for initial load)
  async getMessages(params: GetMessagesRequest): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/messages`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return []; // Return empty array on failure
    }
  }

  // Get list of conversations for a user
  async getConversations(userId: number): Promise<any[]> { // Keeping this generic for now
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/list/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  // Mark messages as read
  async markMessagesAsRead(payload: MarkAsReadRequest): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/chat/mark-read`, payload);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  /**
   * Generate chat ID for two users (consistent with backend and socketService)
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Chat ID string in format "userId1_userId2" (sorted)
   */
  generateChatId(userId1: number, userId2: number): string {
    return [userId1, userId2].sort((a, b) => a - b).join("_");
  }
}

export const chatService = new ChatService();
