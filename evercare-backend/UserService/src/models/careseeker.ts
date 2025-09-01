import { EntitySchema } from "typeorm";

export interface Careseeker {
  careseekerId: number;
  careseekerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export const CareseekerEntity = new EntitySchema<Careseeker>({
  name: "careseeker",
  tableName: "careseeker",
  columns: {
    careseekerId: {
      type: "int",
      primary: true,
      generated: "increment",
     
    },
    careseekerName: {
      type: "varchar",
      nullable: true,
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    email: {
      type: "varchar",
      nullable: true,
    },
    address: {
      type: "varchar",
      nullable: true,
    },
    password: {
      type: "varchar",
      nullable: true,
    },
    confirmPassword: {
      type: "varchar",
      nullable: true,
    },
  },
});
