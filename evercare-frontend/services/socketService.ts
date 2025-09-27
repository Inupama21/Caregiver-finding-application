import { io, Socket } from "socket.io-client";


export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}


export interface SendMessagePayload {
  senderId: number;
  receiverId: number;
  content: string;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = "http://192.168.176.11:5004";

  connect(userId: number, userType: "caregiver" | "careseeker"): void {
    if (this.socket?.connected) {
      console.log("Socket already connected.");
      return;
    }


    this.socket = io(this.serverUrl, {
      transports: ["websocket"], 
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log(`Successfully connected to chat server with socket ID: ${this.socket?.id}`);

      this.socket?.emit("user_online", { userId, userType });
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from chat server: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }


  isConnected(): boolean {
    return this.socket?.connected || false;
  }


  joinChat(chatId: string): void {
    if (!this.socket?.connected) return;
    console.log(`Joining chat room: ${chatId}`);
    this.socket.emit("join_chat", { chatId });
  }

  /**
   * Leaves a chat room when the user navigates away.
   * @param chatId - The unique identifier for the chat room.
   */
  leaveChat(chatId: string): void {
    if (!this.socket?.connected) return;
    console.log(`Leaving chat room: ${chatId}`);
    this.socket.emit("leave_chat", { chatId });
  }

  sendMessage(messagePayload: SendMessagePayload): void {
    if (!this.socket?.connected) {
      console.error("Cannot send message: Socket is not connected.");
      // Optionally, you could implement a queueing system here for offline messages
      return;
    }
    console.log("Sending message via socket:", messagePayload);
    this.socket.emit("send_message", messagePayload);
  }


  sendTyping(senderId: number, receiverId: number, isTyping: boolean): void {
    if (!this.socket?.connected) return;
    const chatId = this.generateChatId(senderId, receiverId);
    this.socket.emit("typing", { receiverId, isTyping, chatId });
  }

  /**
   * Listens for new messages broadcast by the server.
   * @param callback - The function to execute when a new message is received.
   * @returns A function to unsubscribe from the listener.
   */
  onNewMessage(callback: (message: ChatMessage) => void): () => void {
    this.socket?.on("new_message", callback);

    // Return an unsubscribe function for cleanup
    return () => this.socket?.off("new_message", callback);
  }

  onTyping(callback: (data: { userId: number; isTyping: boolean; chatId: string }) => void): () => void {
    this.socket?.on("user_typing", callback);

    // Return an unsubscribe function for cleanup
    return () => this.socket?.off("user_typing", callback);
  }


  generateChatId(userId1: number, userId2: number): string {
    return [userId1, userId2].sort((a, b) => a - b).join("_");
  }
}

// Export a singleton instance of the service
export const socketService = new SocketService();
