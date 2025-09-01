import { EntitySchema } from "typeorm";

export interface CareseekerProfile {
  profileId: number;
  careseekerId: number;

  // About section
  about?: string;
  careType?: string; // Add careType field
  careExperience?: string;
  budgetRange?: string;
  location?: string;
  urgency?: "high" | "medium" | "low";

  // Medical section
  healthConditions?: string[];
  careRequirements?: string[];
  careTasksNeeded?: string[];

  // Preferences section
  preferredGender?: "male" | "female" | "any";
  languages?: string[];

  // Rating & Review section
  overallRating?: number;
  totalReviews?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const CareseekerProfileEntity = new EntitySchema<CareseekerProfile>({
  name: "careseeker_profile",
  tableName: "careseeker_profile",
  columns: {
    profileId: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    careseekerId: {
      type: "int",
      unique: true,
    },

    about: {
      type: "text",
      nullable: true,
    },
    careType: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    careExperience: {
      type: "text",
      nullable: true,
    },
    budgetRange: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    location: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    urgency: {
      type: "enum",
      enum: ["high", "medium", "low"],
      nullable: true,
    },

    // Medical section
    healthConditions: {
      type: "json",
      nullable: true,
    },
    careRequirements: {
      type: "json",
      nullable: true,
    },
    careTasksNeeded: {
      type: "json",
      nullable: true,
    },

    // Preferences section
    preferredGender: {
      type: "enum",
      enum: ["male", "female", "any"],
      nullable: true,
    },
    languages: {
      type: "json",
      nullable: true,
    },

    // Rating & Review section
    overallRating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      nullable: true,
      default: 0,
    },
    totalReviews: {
      type: "int",
      nullable: true,
      default: 0,
    },

    // Metadata
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  indices: [
    {
      name: "IDX_CARESEEKER_PROFILE_CARESEEKER_ID",
      columns: ["careseekerId"],
    },
  ],
});
