import { EntitySchema } from "typeorm";

export interface CaregiverProfile {
  profileId: number;
  caregiverId: number;
  displayName?: string | null;
  age?: number | null;
  experienceYears?: number | null;
  specialization?: string | null;
  description?: string | null;
  profilePhoto?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  clientsCount?: number | null;
  completedJobs?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const CaregiverProfileEntity = new EntitySchema<CaregiverProfile>({
  name: "caregiverProfile",
  tableName: "caregiver_profiles",
  columns: {
    profileId: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    caregiverId: {
      type: "int",
      nullable: false,
      unique: true,
    },
    displayName: {
      type: "varchar",
      nullable: true,
      length: 255,
    },
    age: {
      type: "int",
      nullable: true,
    },
    experienceYears: {
      type: "int",
      nullable: true,
    },
    specialization: {
      type: "varchar",
      nullable: true,
      length: 255,
    },
    description: {
      type: "text",
      nullable: true,
    },
    profilePhoto: {
      type: "text",
      nullable: true,
    },
    averageRating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      nullable: true,
      default: 0,
    },
    reviewsCount: {
      type: "int",
      nullable: true,
      default: 0,
    },
    clientsCount: {
      type: "int",
      nullable: true,
      default: 0,
    },
    completedJobs: {
      type: "int",
      nullable: true,
      default: 0,
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

// Caregiver Posts Model
export interface CaregiverPost {
  postId: number;
  caregiverId: number;
  text: string;
  image?: string | null;
  timestamp: Date;
  likesCount: number;
  commentsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CaregiverPostEntity = new EntitySchema<CaregiverPost>({
  name: "caregiverPost",
  tableName: "caregiver_posts",
  columns: {
    postId: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    caregiverId: {
      type: "int",
      nullable: false,
    },
    text: {
      type: "text",
      nullable: false,
    },
    image: {
      type: "text",
      nullable: true,
    },
    timestamp: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    likesCount: {
      type: "int",
      default: 0,
    },
    commentsCount: {
      type: "int",
      default: 0,
    },
    isActive: {
      type: "boolean",
      default: true,
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
