import { Request, Response } from "express";
import dataSource from "../config/config";
import { ChatEntity } from "../models/chat";


export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user1, user2, limit = 100, offset = 0 } = req.query;
    if (!user1 || !user2) {
      res.status(400).json({ message: "Both user IDs are required" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);
    const messages = await chatRepo.find({
      where: [
        { senderId: Number(user1), receiverId: Number(user2) },
        { senderId: Number(user2), receiverId: Number(user1) },
      ],
      order: { timestamp: "ASC" },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getChatList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);

    if (isNaN(userIdNum)) {
      res.status(400).json({ message: "User ID must be a number" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);


    const conversations = await chatRepo
      .createQueryBuilder("chat")
      .select("CASE WHEN chat.senderId = :userId THEN chat.receiverId ELSE chat.senderId END", "participantId")
      .addSelect("MAX(chat.timestamp)", "lastMessageTime")
      .where("chat.senderId = :userId OR chat.receiverId = :userId", { userId: userIdNum })
      .groupBy("participantId")
      .orderBy("lastMessageTime", "DESC")
      .getRawMany();

    const chatList = [];
    for (const conv of conversations) {
      const participantId = Number(conv.participantId);
      const chatId = [userIdNum, participantId].sort((a, b) => a - b).join("_");


      const lastMessage = await chatRepo.findOne({
        where: [
          { senderId: userIdNum, receiverId: participantId },
          { senderId: participantId, receiverId: userIdNum },
        ],
        order: { timestamp: "DESC" },
      });


      const unreadCount = await chatRepo.count({
        where: {
          senderId: participantId,
          receiverId: userIdNum,
          isRead: false,
        },
      });


      let participant = {
        id: participantId,
        name: `User ${participantId}`,
        userType: 'careseeker',
        avatar: '',
        isOnline: false,
      };

      chatList.push({
        id: chatId,
        participant,
        lastMessage,
        unreadCount,
        updatedAt: lastMessage?.timestamp || new Date(),
      });
    }

    res.json(chatList);
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { readerId, senderId } = req.body;
    if (!readerId || !senderId) {
      res.status(400).json({ message: "Reader ID and Sender ID are required" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);
    // Update all messages sent by 'senderId' to 'readerId' that are currently unread
    await chatRepo.update(
      {
        receiverId: Number(readerId),
        senderId: Number(senderId),
        isRead: false,
      },
      {
        isRead: true, 
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }
    // In a real app, you would query your users table here.
    const mockUsers = [
      { id: 101, name: "Emily Carter", userType: "careseeker" },
      { id: 102, name: "David Chen", userType: "caregiver" },
    ];
    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes((query as string).toLowerCase())
    );
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrGetChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user1Id, user2Id } = req.body;
    if (!user1Id || !user2Id) {
      res.status(400).json({ message: "Both user IDs are required" });
      return;
    }
    const chatId = [user1Id, user2Id].sort((a, b) => a - b).join("_");
    res.json({ chatId });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

