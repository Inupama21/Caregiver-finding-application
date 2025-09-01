import { EntitySchema } from "typeorm";

export interface Review {
  reviewId: number;
  caregiverId: number;
  careseekerId: number;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ReviewEntity = new EntitySchema<Review>({
  name: "review",
  tableName: "reviews",
  columns: {
    reviewId: {
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
    rating: {
      type: "int",
      nullable: false,
    },
    comment: {
      type: "text",
      nullable: true,
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
  indices: [
    {
      name: "IDX_CAREGIVER_ID",
      columns: ["caregiverId"],
    },
    {
      name: "IDX_CARESEEKER_ID",
      columns: ["careseekerId"],
    },
    {
      name: "IDX_UNIQUE_REVIEW",
      columns: ["caregiverId", "careseekerId"],
      unique: true, // One review per careseeker-caregiver pair
    },
  ],
});
