import { EntitySchema } from "typeorm";

export interface Payment {
  id: number;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  careseekerId?: number;
  caregiverId?: number;
  bookingId?: number;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentEntity = new EntitySchema<Payment>({
  name: "payment",
  tableName: "payments",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    paymentIntentId: {
      type: "varchar",
    },
    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    currency: {
      type: "varchar",
    },
    status: {
      type: "varchar",
    },
    careseekerId: {
      type: "int",
      nullable: true,
    },
    caregiverId: {
      type: "int",
      nullable: true,
    },
    bookingId: {
      type: "int",
      nullable: true,
    },
    description: {
      type: "varchar",
      nullable: true,
    },
    metadata: {
      type: "json",
      nullable: true,
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
