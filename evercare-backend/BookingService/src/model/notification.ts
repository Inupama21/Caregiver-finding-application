// models/notification.ts
import { EntitySchema } from "typeorm";

export interface Notification {
  notificationId: number;
  bookingId: number;
  careseekerId: number;
  caregiverId: number;
  type: string; 
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationEntity = new EntitySchema<Notification>({
  name: "Notification",
  tableName: "booking_notifications",
  columns: {
    notificationId: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    bookingId: {
      type: "int",
    },
    careseekerId: {
      type: "int",
    },
    caregiverId: {
      type: "int",
    },
    type: {
      type: "varchar",
    },
    message: {
      type: "varchar",
    },
    isRead: {
      type: "boolean",
      default: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
