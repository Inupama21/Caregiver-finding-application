import { Router } from "express";
import {
  createJobPost,
  getAllPosts,
  getPostsByCareseeker,
  deletePost,
  updatePost,
} from "../controller/jobController";

const router = Router();

router.post("/", createJobPost);
router.get("/", getAllPosts);
router.get("/careseeker/:careseekerId", getPostsByCareseeker);
router.delete("/:id", deletePost);
router.put("/:id", updatePost);

export default router;
