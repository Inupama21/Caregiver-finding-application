import { EntitySchema } from "typeorm";

export interface Booking {
  bookingId: number;
  caregiverId: number;
  careseekerId: number;
  name: string;
  address: string;
  phone: string;
  startDate: Date;
  endDate: Date;
  expectedDays: string;
  patientDescription: string;
  paymentMethod: string;
  caregiverName: string;
  caregiverRate: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export const BookingEntity = new EntitySchema<Booking>({
  name: "booking",
  tableName: "booking",
  columns: {
    bookingId: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    caregiverId: {
      type: "int",
      nullable: true,
    },
    careseekerId: {
      type: "int",
      nullable: true,
    },
    name: {
      type: "varchar",
    },
    address: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
    },
    startDate: {
      type: "timestamp",
      nullable: true,
    },
    endDate: {
      type: "timestamp",
      nullable: true,
    },
    expectedDays: {
      type: "varchar",
    },
    patientDescription: {
      type: "text",
    },
    paymentMethod: {
      type: "varchar",
    },
    caregiverName: {
      type: "varchar",
    },
    caregiverRate: {
      type: "varchar",
    },
    status: {
      type: "enum",
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
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
