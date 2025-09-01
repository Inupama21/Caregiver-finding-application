import express, { Router } from "express";
import {
  sendMessage,
  getMessages,
  getChatList,
  searchUsers,
  createOrGetChat,
  markAsRead,
  getUnreadCount,
} from "../controller/chatController";

const router: Router = express.Router();

// Route to send a message
router.post("/send", sendMessage);

// Route to get messages between two users
router.get("/messages", getMessages);

// Route to get chat list for a user
router.get("/list/:userId", getChatList);

// Route to search users
router.get("/search-users", searchUsers);

// Route to create or get existing chat
router.post("/create", createOrGetChat);

// Route to mark messages as read
router.post("/mark-read", markAsRead);

// Route to get unread message count
router.get("/unread-count/:userId", getUnreadCount);

export default router;
