import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import chatRoutes from "./src/route/chatRoutes";
import dataSource from "./src/config/config";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const server = createServer(app);

// Socket.IO setup with built-in CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active users and their socket connections
const activeUsers = new Map<number, { socketId: string; userType: string }>();
const userSockets = new Map<string, number>();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User comes online
  socket.on("user_online", ({ userId, userType }) => {
    activeUsers.set(userId, { socketId: socket.id, userType });
    userSockets.set(socket.id, userId);

    // Broadcast user status to other users
    socket.broadcast.emit("user_status_change", { userId, isOnline: true });

    console.log(`User ${userId} (${userType}) is now online`);
  });

  // Join a chat room
  socket.on("join_chat", ({ chatId }) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave_chat", ({ chatId }) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat ${chatId}`);
  });

  // Handle message sending
  socket.on("send_message", (messageData) => {
    const { senderId, receiverId, content, senderName, senderType } =
      messageData;
    const chatId = [senderId, receiverId].sort().join("_");

    // Create message object
    const message = {
      id: `${Date.now()}_${senderId}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      senderName,
      senderType,
    };

    // Send to all users in the chat room
    io.to(chatId).emit("new_message", message);

    // Also send directly to the receiver if they're not in the chat room
    const receiverData = activeUsers.get(receiverId);
    if (receiverData) {
      io.to(receiverData.socketId).emit("new_message", message);
    }

    console.log(
      `Message sent from ${senderId} to ${receiverId} in chat ${chatId}`
    );
  });

  // Handle typing indicators
  socket.on("typing", ({ receiverId, isTyping, chatId }) => {
    const senderId = userSockets.get(socket.id);
    if (!senderId) return;

    const receiverData = activeUsers.get(receiverId);
    if (receiverData) {
      io.to(receiverData.socketId).emit("user_typing", {
        userId: senderId,
        isTyping,
        chatId,
      });
    }

    // Also broadcast to chat room
    socket.to(chatId).emit("user_typing", {
      userId: senderId,
      isTyping,
      chatId,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = userSockets.get(socket.id);

    if (userId) {
      activeUsers.delete(userId);
      userSockets.delete(socket.id);

      // Broadcast user going offline
      socket.broadcast.emit("user_status_change", { userId, isOnline: false });

      console.log(`User ${userId} disconnected`);
    }

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set("io", io);

// CORS configuration for Express routes
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ChatService",
    timestamp: new Date().toISOString(),
    port: process.env.CHAT_SERVICE_PORT || 5004,
  });
});

// API documentation
app.get("/", (req, res) => {
  res.json({
    service: "ChatService",
    version: "1.0.0",
    description: "Chat functionality microservice",
    endpoints: {
      health: "/health",
      chat: "/chat/*",
    },
  });
});

// Mount chat routes
app.use("/chat", chatRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("ChatService Error:", err.stack);
    res.status(500).json({
      error: "ChatService Error",
      message: err.message,
    });
  }
);

const PORT = Number(process.env.CHAT_SERVICE_PORT) || 5004;

// Initialize database and start server
dataSource
  .initialize()
  .then(() => {
    console.log("✅ ChatService database connected successfully");
    server.listen(PORT, () => {
      console.log(`ChatService running on port ${PORT}`);
      // console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(`API docs: http://localhost:${PORT}/`);
      console.log(`Socket.IO server ready for connections`);
    });
  })
  .catch((error) => {
    console.error(" Error connecting ChatService to database:", error);
    process.exit(1);
  });

export default app;
