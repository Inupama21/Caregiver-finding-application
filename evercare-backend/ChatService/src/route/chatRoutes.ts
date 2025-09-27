import express, { Router } from "express";
import {
  getMessages,
  getChatList,
  searchUsers,
  createOrGetChat,
  markAsRead,
} from "../controller/chatController";

const router: Router = express.Router();

router.get("/messages", getMessages);

router.get("/list/:userId", getChatList);

router.get("/search-users", searchUsers);

router.post("/create", createOrGetChat);

router.post("/mark-read", markAsRead);

export default router;
