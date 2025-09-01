import { EntitySchema } from "typeorm";

export interface Chat {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

export const ChatEntity = new EntitySchema<Chat>({
  name: "Chat", 
  tableName: "chat",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
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
  },
});



// const { EntitySchema } = require("typeorm");

// const Message = new EntitySchema({
//     name: "messages",
//     tableName: "messages",
//     columns: {
//         id: {
//             primary: true,
//             type: "int",
//             generated: true,
//         },
//         senderId: {
//             type: "int",
//         },
//         receiverId: {
//             type: "int",
//         },
//         content: {
//             type: "text",
//         },
//         timestamp: {
//             type: "timestamp",
//             createDate: true,
//         },
//     },
// });

// module.exports = { Message }; 