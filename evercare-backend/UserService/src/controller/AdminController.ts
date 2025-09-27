// AdminController.ts

import { Request, Response } from "express";
import dataSource from "../config/config";
import { Admin } from "../models/Admin";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../../jwt";

// Admin login function
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("Admin login attempt:", { email, password: password ? "***" : "undefined" });

    if (!email || !password) {
      console.log("Missing email or password");
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const adminRepository = dataSource.getRepository<Admin>("Admin");
    const admin = await adminRepository.findOne({ where: { email } });
    console.log("Admin found:", admin ? "Yes" : "No");

    if (!admin || !admin.password) {
      console.log("Admin not found or no password");
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, admin.password);
    console.log("Password match:", match);
    if (!match) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!admin.email) {
      res.status(500).json({ message: "Admin email is missing" });
      return;
    }

    const accessToken = createAccessToken({ 
      id: admin.adminId, 
      email: admin.email, 
      userType: "admin" 
    });
    const refreshToken = createRefreshToken({ 
      id: admin.adminId, 
      userType: "admin" 
    });

    const { password: _, ...adminSafe } = admin;
    res.status(200).json({
      message: "Admin login successful",
      accessToken,
      refreshToken,
      admin: adminSafe,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current admin profile (from JWT token)
export const getCurrentAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.adminId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const adminRepository = dataSource.getRepository<Admin>("Admin");
    const admin = await adminRepository.findOne({
      where: { adminId: req.user.adminId },
    });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Return admin without password
    const { password, ...adminSafe } = admin;
    res.status(200).json({
      message: "Admin profile retrieved successfully",
      admin: adminSafe,
    });
  } catch (error) {
    console.error("Error getting current admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user information by ID (for ChatService)
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    // Try to find as caregiver first
    const caregiverRepository = dataSource.getRepository("caregiver");
    const caregiver = await caregiverRepository.findOne({
      where: { caregiverId: userId },
    });

    if (caregiver) {
      const { password, ...caregiverSafe } = caregiver;
      res.status(200).json({
        id: caregiver.caregiverId,
        name: caregiver.caregiverName,
        userType: "caregiver",
        email: caregiver.email,
        profileImage: caregiver.caregiverPhoto,
        ...caregiverSafe,
      });
      return;
    }

    // Try to find as careseeker
    const careseekerRepository = dataSource.getRepository("careseeker");
    const careseeker = await careseekerRepository.findOne({
      where: { careseekerId: userId },
    });

    if (careseeker) {
      const { password, ...careseekerSafe } = careseeker;
      res.status(200).json({
        id: careseeker.careseekerId,
        name: careseeker.careseekerName,
        userType: "careseeker",
        email: careseeker.email,
        ...careseekerSafe,
      });
      return;
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};