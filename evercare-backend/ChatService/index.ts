import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import chatRoutes from "./src/route/chatRoutes";
import dataSource from "./src/config/config";
import { ChatEntity } from "./src/models/chat";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://192.168.176.11:8081"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const activeUsers = new Map<number, { socketId: string; userType: string }>();
const userSockets = new Map<string, number>();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user_online", ({ userId, userType }) => {
    if (userId) {
      activeUsers.set(userId, { socketId: socket.id, userType });
      userSockets.set(socket.id, userId);
      socket.broadcast.emit("user_status_change", { userId, isOnline: true });
      console.log(`User ${userId} is online.`);
    }
  });

  socket.on("join_chat", ({ chatId }) => {
    if (chatId) {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
    }
  });

  socket.on("leave_chat", ({ chatId }) => {
    if (chatId) {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat room: ${chatId}`);
    }
  });

  socket.on("send_message", async (messageData) => {
    const { senderId, receiverId, content } = messageData;
    if (!senderId || !receiverId || !content) {
      socket.emit("message_error", { message: "Invalid message data" });
      return;
    }

    try {
      const messageRepo = dataSource.getRepository(ChatEntity);
      const newMessage = messageRepo.create({ senderId, receiverId, content });
      const savedMessage = await messageRepo.save(newMessage);

      const chatId = [senderId, receiverId].sort((a, b) => a - b).join("_");

      io.to(chatId).emit("new_message", savedMessage);
      console.log(
        `Message from ${senderId} to ${receiverId} broadcasted to room ${chatId}`
      );
    } catch (error) {
      console.error("Error saving or broadcasting message:", error);
      socket.emit("message_error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", ({ receiverId, isTyping, chatId }) => {
    const senderId = userSockets.get(socket.id);
    if (!senderId || !chatId) return;

    socket.to(chatId).emit("user_typing", {
      userId: senderId,
      isTyping,
      chatId,
    });
  });

  socket.on("disconnect", () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      activeUsers.delete(userId);
      userSockets.delete(socket.id);
      socket.broadcast.emit("user_status_change", { userId, isOnline: false });
      console.log(`User ${userId} disconnected.`);
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/chat", chatRoutes);

const PORT = Number(process.env.CHAT_SERVICE_PORT) || 5004;

dataSource
  .initialize()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`ChatService running on port ${PORT}`)
    );
  })
  .catch((error) => console.error("Database connection error:", error));

export default app;
