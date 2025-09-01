import { EntitySchema } from "typeorm";

export interface Post {
  postId: number;
  careseekerId?: number;
  caregiverId?: number;
  caregiverName: string;
  age: number;
  careType: string;
  duration: string;
  district: string;
  urgency: string;
  description: string;
}

export const PostEntity = new EntitySchema<Post>({
  name: "posts",
  tableName: "posts",
  columns: {
    postId: {
      type: Number,
      primary: true,
      generated: "increment",
    },
    careseekerId: {
      type: Number,
      nullable: true,
    },
    caregiverId: {
      type: Number,
      nullable: true,
    },
    
    caregiverName: {
      type: String,
      nullable: true,
    },
    age: {
      type: Number,
    },
    careType: {
      type: String,
    },
    duration: {
      type: String,
    },
    district: {
      type: String,
    },
    urgency: {
      type: String,
    },
    description: {
      type: String,
    },
  },
});
