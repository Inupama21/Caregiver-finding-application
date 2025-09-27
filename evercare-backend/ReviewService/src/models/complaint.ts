import { EntitySchema } from "typeorm";

export interface Complaint {
  complaintId: number;
  caregiverId: number;
  careseekerId: number;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  adminNotes?: string;
}

export const ComplaintEntity = new EntitySchema<Complaint>({
  name: "complaint",
  tableName: "complaints",
  columns: {
    complaintId: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    caregiverId: {
      type: "int",
      nullable: false,
    },
    careseekerId: {
      type: "int",
      nullable: false,
    },
    subject: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      nullable: false,
    },
    priority: {
      type: "enum",
      enum: ['low', 'medium', 'high'],
      default: 'medium',
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
    resolvedAt: {
      type: "timestamp",
      nullable: true,
    },
    adminNotes: {
      type: "text",
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_COMPLAINT_CAREGIVER_ID",
      columns: ["caregiverId"],
    },
    {
      name: "IDX_COMPLAINT_CARESEEKER_ID",
      columns: ["careseekerId"],
    },
    {
      name: "IDX_COMPLAINT_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_COMPLAINT_PRIORITY",
      columns: ["priority"],
    },
  ],
});
