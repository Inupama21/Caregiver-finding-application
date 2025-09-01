import { Request, Response } from "express";
import dataSource from "../config/config";
import { CaregiverProfile, CaregiverPost } from "../models/caregiverProfile";
import path from "path";
import fs from "fs";

interface CreateProfileBody {
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
}

interface UpdateProfileBody {
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
}

interface CreatePostBody {
  text: string;
  image?: string | null;
}

// Get all caregiver profiles
export const getAllCaregiverProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    const [profiles, total] = await profileRepository.findAndCount({
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
    });

    res.status(200).json({
      profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching caregiver profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get caregiver profile by caregiverId
export const getCaregiverProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid caregiver ID" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    const profile = await profileRepository.findOne({
      where: { caregiverId },
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching caregiver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new caregiver profile
export const createCaregiverProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profileData = req.body as CreateProfileBody;

    if (!profileData.caregiverId) {
      res.status(400).json({ error: "caregiverId is required" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    // Check if profile already exists
    const existingProfile = await profileRepository.findOne({
      where: { caregiverId: profileData.caregiverId },
    });

    if (existingProfile) {
      res
        .status(409)
        .json({ error: "Profile already exists for this caregiver" });
      return;
    }

    const newProfile = profileRepository.create({
      ...profileData,
      averageRating: profileData.averageRating || 0,
      reviewsCount: profileData.reviewsCount || 0,
      clientsCount: profileData.clientsCount || 0,
      completedJobs: profileData.completedJobs || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedProfile = await profileRepository.save(newProfile);

    res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Error creating caregiver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update caregiver profile
export const updateCaregiverProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    const updates = req.body as UpdateProfileBody;

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid caregiver ID" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    const profile = await profileRepository.findOne({
      where: { caregiverId },
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    // Update only provided fields
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof UpdateProfileBody] !== undefined) {
        (profile as any)[key] = updates[key as keyof UpdateProfileBody];
      }
    });

    profile.updatedAt = new Date();

    const updatedProfile = await profileRepository.save(profile);

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating caregiver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete caregiver profile
export const deleteCaregiverProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid caregiver ID" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    const profile = await profileRepository.findOne({
      where: { caregiverId },
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    await profileRepository.remove(profile);

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting caregiver profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload profile photo (simplified version - expects base64 image in request body)
export const uploadProfilePhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    const { profilePhoto } = req.body; // Expecting base64 image string

    if (!profilePhoto) {
      res.status(400).json({ error: "No image data provided" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CaregiverProfile>("caregiverProfile");

    const profile = await profileRepository.findOne({
      where: { caregiverId },
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    // Update profile photo (storing as base64 or URL)
    profile.profilePhoto = profilePhoto;
    profile.updatedAt = new Date();

    const updatedProfile = await profileRepository.save(profile);

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      profilePhoto: profile.profilePhoto,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CAREGIVER POSTS CONTROLLERS

// Get caregiver posts
export const getCaregiverPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid caregiver ID" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const [posts, total] = await postRepository.findAndCount({
      where: {
        caregiverId,
        isActive: true,
      },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
    });

    // Format posts with proper timestamp format
    const formattedPosts = posts.map((post) => ({
      ...post,
      timestamp: post.timestamp.toISOString(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching caregiver posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new post
export const createCaregiverPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    const { text, image } = req.body as CreatePostBody;

    if (!caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid caregiver ID" });
      return;
    }

    if (!text || text.trim() === "") {
      res.status(400).json({ error: "Post text is required" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const newPost = postRepository.create({
      caregiverId,
      text: text.trim(),
      image: image || null,
      timestamp: new Date(),
      likesCount: 0,
      commentsCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedPost = await postRepository.save(newPost);

    // Format response
    const formattedPost = {
      ...savedPost,
      timestamp: savedPost.timestamp.toISOString(),
    };

    res.status(201).json(formattedPost);
  } catch (error) {
    console.error("Error creating caregiver post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a post
export const updateCaregiverPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);
    const caregiverId = Number(req.params.caregiverId);
    const { text, image } = req.body as CreatePostBody;

    if (!postId || isNaN(postId) || !caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid post ID or caregiver ID" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const post = await postRepository.findOne({
      where: {
        postId,
        caregiverId,
        isActive: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Update post fields
    if (text !== undefined) post.text = text.trim();
    if (image !== undefined) post.image = image;
    post.updatedAt = new Date();

    const updatedPost = await postRepository.save(post);

    // Format response
    const formattedPost = {
      ...updatedPost,
      timestamp: updatedPost.timestamp.toISOString(),
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Error updating caregiver post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a post (soft delete)
export const deleteCaregiverPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);
    const caregiverId = Number(req.params.caregiverId);

    if (!postId || isNaN(postId) || !caregiverId || isNaN(caregiverId)) {
      res.status(400).json({ error: "Invalid post ID or caregiver ID" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const post = await postRepository.findOne({
      where: {
        postId,
        caregiverId,
        isActive: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Soft delete
    post.isActive = false;
    post.updatedAt = new Date();

    await postRepository.save(post);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting caregiver post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Like a post
export const likeCaregiverPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);

    if (!postId || isNaN(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const post = await postRepository.findOne({
      where: {
        postId,
        isActive: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Increment likes count
    post.likesCount = post.likesCount + 1;
    post.updatedAt = new Date();

    const updatedPost = await postRepository.save(post);

    res.status(200).json({
      message: "Post liked successfully",
      likesCount: updatedPost.likesCount,
    });
  } catch (error) {
    console.error("Error liking caregiver post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Comment on a post
export const commentCaregiverPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);

    if (!postId || isNaN(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const postRepository =
      dataSource.getRepository<CaregiverPost>("caregiverPost");

    const post = await postRepository.findOne({
      where: {
        postId,
        isActive: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Increment comments count
    post.commentsCount = post.commentsCount + 1;
    post.updatedAt = new Date();

    const updatedPost = await postRepository.save(post);

    res.status(200).json({
      message: "Comment added successfully",
      commentsCount: updatedPost.commentsCount,
    });
  } catch (error) {
    console.error("Error commenting on caregiver post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
