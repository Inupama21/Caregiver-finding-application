// models/notification.ts
import { EntitySchema } from "typeorm";

export interface Notification {
  notificationId: number;
  careseekerId: number;
  caregiverId: number;
  postId: number;
  type: string;
  message: string;
  createdAt: Date;
}

export const NotificationEntity = new EntitySchema<Notification>({
  name: "Notification",
  tableName: "notifications",
  columns: {
    notificationId: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    careseekerId: {
      type: "int",
    },
    caregiverId: {
      type: "int",
    },
    postId: {
      type: "int",
    },
    type: {
      type: "varchar",
    },
    message: {
      type: "varchar",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
});
