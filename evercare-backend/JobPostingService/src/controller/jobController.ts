import { Request, Response } from "express";
import dataSource from "../config/config";
import { PostEntity } from "../models/post";

interface CreateJobBody {
  caregiverName?: string;
  careseekerId?: number;
  age?: number;
  careType: string;
  duration: string;
  district?: string;
  urgency?: string;
  description?: string;
  caregiverId?: number;
}

export const createJobPost = async (
  req: Request<unknown, unknown, CreateJobBody>,
  res: Response
): Promise<void> => {
  console.log("=== DEBUG: Received data ===");
  console.log("Full req.body:", req.body);
  console.log("careseekerId:", req.body.careseekerId);
  console.log("careseekerId type:", typeof req.body.careseekerId);
  console.log("careseekerId value:", req.body.careseekerId);
  console.log("Is careseekerId truthy?", !!req.body.careseekerId);
  console.log("Is careseekerId 0?", req.body.careseekerId === 0);
  console.log("===========================");

  try {
    const {
      caregiverName,
      careseekerId,
      age,
      careType,
      duration,
      district,
      urgency,
      description,
      caregiverId,
    } = req.body;

    // Validate required fields - check for undefined, null, or NaN
    if (
      careseekerId === undefined ||
      careseekerId === null ||
      isNaN(Number(careseekerId))
    ) {
      console.log(" Validation failed: careseekerId is invalid");
      res
        .status(400)
        .json({
          message: "Careseeker ID is required and must be a valid number",
        });
      return;
    }

    if (!careType || !duration || !district || !urgency || !description) {
      console.log(" Validation failed: missing required fields");
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    console.log("Validation passed. Creating job with:", {
      caregiverName,
      careseekerId,
      age,
      careType,
      duration,
      district,
      urgency,
      description,
      caregiverId,
    });

    const jobRepository = dataSource.getRepository(PostEntity);

    const job = jobRepository.create({
      caregiverName,
      careseekerId,
      age,
      careType,
      duration,
      district,
      urgency,
      description,
      caregiverId,
    });

    const savedJob = await jobRepository.save(job);

    res.status(201).json({
      message: "Post created successfully",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jobRepository = dataSource.getRepository(PostEntity);
    const posts = await jobRepository.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostsByCareseeker = async (
  req: Request<{ careseekerId: string }>,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = parseInt(req.params.careseekerId, 10);
    const jobRepository = dataSource.getRepository(PostEntity);

    const posts = await jobRepository.find({
      where: { careseekerId },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts by careseeker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const postId = parseInt(req.params.id, 10);
    const postRepository = dataSource.getRepository(PostEntity);

    const post = await postRepository.findOne({ where: { postId } });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    await postRepository.remove(post);

    res.status(201).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePost = async (
  req: Request<{ postId: string }, unknown, { description?: string }>,
  res: Response
): Promise<void> => {
  const { postId } = req.params;
  const { description } = req.body;

  try {
    const postRepo = dataSource.getRepository(PostEntity);
    const post = await postRepo.findOne({
      where: { postId: parseInt(postId, 10) },
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (description) post.description = description;

    await postRepo.save(post);

    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
