import { EntitySchema } from "typeorm";

export interface Chat {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean; // To track if the message has been read
}

export const ChatEntity = new EntitySchema<Chat>({
  name: "Chat",
  tableName: "chat",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    senderId: {
      type: "int",
    },
    receiverId: {
      type: "int",
    },
    content: {
      type: "text",
    },
    timestamp: {
      type: "timestamp",
      createDate: true, 
    },
    isRead: {
      type: "boolean",
      default: false, 
    },
  },
});
