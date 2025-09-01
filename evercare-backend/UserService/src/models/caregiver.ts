import { EntitySchema } from "typeorm";

export interface Caregiver {
  caregiverId: number;
  caregiverName?: string;
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
  district?: string;
  nic?: string;
  password?: string;
  confirmPassword?: string;
  idPhoto?: string;
  caregiverPhoto?: string;
}

export const CaregiverEntity = new EntitySchema<Caregiver>({
  name: "caregiver",
  tableName: "caregiver",
  columns: {
    caregiverId: {
      type: "int",
      primary: true,
      generated: "increment",
     
    },
    caregiverName: {
      type: "varchar",
      nullable: true,
    },
     dateOfBirth: {
      type: "date",
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
    district: {
      type: "varchar",
      nullable: true,
    },
    nic: {
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
