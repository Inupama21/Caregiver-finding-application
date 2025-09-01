import { Request, Response } from "express";
import dataSource from "../config/config";
import { Careseeker } from "../models/careseeker";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { careseekerName, email, password, confirmPassword, phone, address } =
      req.body;

    if (!email || !password || !confirmPassword) {
      res.status(400).json({ message: "Required fields are mandatory" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const userRepository = dataSource.getRepository<Careseeker>("careseeker");
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      careseekerName,
      email,
      phone,
      address,
      password: hashedPassword,
    });
    await userRepository.save(user);

    const token = jwt.sign(
      {
        careseekerId: user.careseekerId,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userSafe } = user;
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const userRepository = dataSource.getRepository<Careseeker>("careseeker");
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!user.password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      {
        careseekerId: user.careseekerId,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userSafe } = user;
    res.status(200).json({
      message: "Login successful",
      token,
      user: userSafe,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);

    // Verify the user can only update their own profile
    if (req.user && req.user.careseekerId !== careseekerId) {
      res.status(403).json({ message: "You can only update your own profile" });
      return;
    }

    const userRepo = dataSource.getRepository<Careseeker>("careseeker");
    const user = await userRepo.findOne({ where: { careseekerId } });

    if (!user) {
      res.status(404).json({ message: "Can't find the careseeker profile!" });
      return;
    }

    // Update user fields from request body (exclude sensitive fields)
    const { password, confirmPassword, email, ...updateData } = req.body;
    Object.assign(user, updateData);

    await userRepo.save(user);

    // Return user without password
    const { password: _, ...userSafe } = user;
    res.status(200).json({
      message: "Profile updated successfully",
      user: userSafe,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);

    // Verify the user can only delete their own profile
    if (req.user && req.user.careseekerId !== careseekerId) {
      res.status(403).json({ message: "You can only delete your own profile" });
      return;
    }

    const userRepository = dataSource.getRepository<Careseeker>("careseeker");
    const user = await userRepository.findOne({ where: { careseekerId } });

    if (!user) {
      res.status(404).json({ message: "Careseeker not found" });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({
      message: "Careseeker profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user profile (from JWT token)
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.careseekerId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userRepository = dataSource.getRepository<Careseeker>("careseeker");
    const user = await userRepository.findOne({
      where: { careseekerId: req.user.careseekerId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return user without password
    const { password, ...userSafe } = user;
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: userSafe,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
