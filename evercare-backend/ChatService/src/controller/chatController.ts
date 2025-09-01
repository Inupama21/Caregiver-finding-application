import { Request, Response } from "express";
import dataSource from "../config/config";
import { ChatEntity } from "../models/chat";

// Send a message
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const messageRepo = dataSource.getRepository(ChatEntity);
    const message = messageRepo.create({ senderId, receiverId, content });
    const savedMessage = await messageRepo.save(message);

    res.status(201).json({ message: "Message sent", data: savedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all messages between two users
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user1, user2, limit = 50, offset = 0 } = req.query;

    if (!user1 || !user2) {
      res.status(400).json({ message: "Both user IDs are required" });
      return;
    }

    const user1Id = Number(user1);
    const user2Id = Number(user2);
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    if (isNaN(user1Id) || isNaN(user2Id)) {
      res.status(400).json({ message: "User IDs must be numbers" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);
    const messages = await chatRepo.find({
      where: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      order: { timestamp: "ASC" },
      take: limitNum,
      skip: offsetNum,
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat list for a user
export const getChatList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);

    if (isNaN(userIdNum)) {
      res.status(400).json({ message: "User ID must be a number" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);

    // Get all conversations for this user
    const conversations = await chatRepo
      .createQueryBuilder("chat")
      .select([
        "CASE WHEN chat.senderId = :userId THEN chat.receiverId ELSE chat.senderId END as participantId",
        "MAX(chat.timestamp) as lastMessageTime",
      ])
      .where("chat.senderId = :userId OR chat.receiverId = :userId")
      .setParameter("userId", userIdNum)
      .groupBy("participantId")
      .orderBy("lastMessageTime", "DESC")
      .getRawMany();

    // Get the last message and unread count for each conversation
    const chatList = [];
    for (const conv of conversations) {
      const participantId = conv.participantId;
      const chatId = [userIdNum, participantId].sort().join("_");

      // Get last message
      const lastMessage = await chatRepo.findOne({
        where: [
          { senderId: userIdNum, receiverId: participantId },
          { senderId: participantId, receiverId: userIdNum },
        ],
        order: { timestamp: "DESC" },
      });

      // Count unread messages (messages sent to this user that haven't been read)
      const unreadCount = await chatRepo.count({
        where: {
          senderId: participantId,
          receiverId: userIdNum,
          // In a real app, you'd have an 'isRead' field
        },
      });

      // Mock participant data (in real app, fetch from UserService)
      const participant = {
        id: participantId,
        name: `User ${participantId}`,
        userType: participantId % 2 === 0 ? "caregiver" : "careseeker",
        avatar: `https://via.placeholder.com/50x50?text=U${participantId}`,
        isOnline: Math.random() > 0.5, // Random online status for demo
      };

      chatList.push({
        id: chatId,
        participant,
        lastMessage,
        unreadCount: Math.floor(Math.random() * 3), // Random unread count for demo
        updatedAt: lastMessage?.timestamp || new Date(),
      });
    }

    res.json(chatList);
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users (mock implementation)
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, userType } = req.query;

    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Mock user search results (in real app, fetch from UserService)
    const mockUsers = [
      {
        id: 1,
        name: "John Doe",
        userType: "caregiver",
        avatar: "https://via.placeholder.com/50x50?text=JD",
      },
      {
        id: 2,
        name: "Jane Smith",
        userType: "careseeker",
        avatar: "https://via.placeholder.com/50x50?text=JS",
      },
      {
        id: 3,
        name: "Mike Johnson",
        userType: "caregiver",
        avatar: "https://via.placeholder.com/50x50?text=MJ",
      },
      {
        id: 4,
        name: "Sarah Wilson",
        userType: "careseeker",
        avatar: "https://via.placeholder.com/50x50?text=SW",
      },
      {
        id: 5,
        name: "David Brown",
        userType: "caregiver",
        avatar: "https://via.placeholder.com/50x50?text=DB",
      },
    ];

    const filteredUsers = mockUsers.filter((user) => {
      const matchesQuery = user.name
        .toLowerCase()
        .includes((query as string).toLowerCase());
      const matchesType = !userType || user.userType === userType;
      return matchesQuery && matchesType;
    });

    res.json(filteredUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create or get existing chat
export const createOrGetChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      res.status(400).json({ message: "Both user IDs are required" });
      return;
    }

    if (user1Id === user2Id) {
      res.status(400).json({ message: "Cannot create chat with yourself" });
      return;
    }

    const chatId = [user1Id, user2Id].sort().join("_");
    res.json({ chatId });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark messages as read
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      res.status(400).json({ message: "Chat ID and user ID are required" });
      return;
    }

    // In a real implementation, you would update the 'isRead' field
    // For now, just return success
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread message count
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);

    if (isNaN(userIdNum)) {
      res.status(400).json({ message: "User ID must be a number" });
      return;
    }

    const chatRepo = dataSource.getRepository(ChatEntity);

    // Count messages where this user is the receiver
    // In a real app, you'd have an 'isRead' field to filter by
    const unreadCount = await chatRepo.count({
      where: {
        receiverId: userIdNum,
        // isRead: false // Add this field in real implementation
      },
    });

    res.json({ count: Math.floor(Math.random() * 10) }); // Random count for demo
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Internal server error", count: 0 });
  }
};
