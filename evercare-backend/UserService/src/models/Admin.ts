import { EntitySchema } from "typeorm";

export interface Admin {
  adminId: number;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AdminEntity = new EntitySchema<Admin>({
  name: "Admin",
  tableName: "admin",
  columns: {
    adminId: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
});
