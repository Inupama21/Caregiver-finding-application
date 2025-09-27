import { Request, Response } from "express";
import dataSource from "../config/config";
import { Caregiver } from "../models/caregiver";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../../jwt";

interface RegisterUserBody {
  caregiverId: number;
  caregiverName?: string;
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
  district?: string;
  nic?: string;
  password?: string;
  confirmPassword?: string;
  idPhoto?: string;
  caregiverPhoto?: string;
}
interface LoginUserBody {
  email: string;
  password: string;
}

export const registerCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { caregiverName, email, password, phone, district, confirmPassword, idPhoto, caregiverPhoto } =
      req.body as RegisterUserBody;

    if (!email || !password || !confirmPassword) {
      res.status(400).json({ message: "Required fields are mandatory" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const userRepository = dataSource.getRepository<Caregiver>("caregiver");
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      caregiverName,
      phone,
      email,
      district,
      password: hashedPassword,
      idPhoto,
      caregiverPhoto,
    });

    await userRepository.save(user);

    // Generate both tokens upon successful registration
    const accessToken = createAccessToken({ id: user.caregiverId, email: user.email! });
    const refreshToken = createRefreshToken({ id: user.caregiverId });

    // Send both tokens to the client
    const { password: _, ...userSafe } = user;
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: userSafe,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginCaregiver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserBody;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const caregiverRepository = dataSource.getRepository<Caregiver>("caregiver");
    const caregiver = await caregiverRepository.findOne({ where: { email } });

    if (!caregiver || !caregiver.password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, caregiver.password);
    if (!match) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate both tokens upon successful login
    const accessToken = createAccessToken({ id: caregiver.caregiverId, email: caregiver.email! });
    const refreshToken = createRefreshToken({ id: caregiver.caregiverId });

    const { password: _, ...caregiverSafe } = caregiver;
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: caregiverSafe,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh Token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: number };
    
    const newAccessToken = createAccessToken({ id: decoded.id, email: "" });
    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const updateCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    
    // Check if the authenticated user is trying to update their own profile
    if (!req.user || req.user.id !== caregiverId) {
      res.status(403).json({ message: "Access denied. You can only update your own profile." });
      return;
    }

    const userRepo = dataSource.getRepository<Caregiver>("caregiver");
    const user = await userRepo.findOne({ where: { caregiverId } });

    if (!user) {
      res.status(404).json({ message: "Caregiver profile not found!" });
      return;
    }

    // Extract allowed fields for update
    const { caregiverName, phone, district, idPhoto, caregiverPhoto } = req.body;
    
    // Update only the provided fields
    if (caregiverName !== undefined) user.caregiverName = caregiverName;
    if (phone !== undefined) user.phone = phone;
    if (district !== undefined) user.district = district;
    if (idPhoto !== undefined) user.idPhoto = idPhoto;
    if (caregiverPhoto !== undefined) user.caregiverPhoto = caregiverPhoto;

    await userRepo.save(user);
    
    
    const { password, ...userSafe } = user;
    res.status(200).json({
      message: "Caregiver profile updated successfully",
      user: userSafe,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current caregiver profile 
export const getCurrentCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const caregiverRepository = dataSource.getRepository<Caregiver>("caregiver");
    const caregiver = await caregiverRepository.findOne({
      where: { caregiverId: req.user.id },
    });

    if (!caregiver) {
      res.status(404).json({ message: "Caregiver not found" });
      return;
    }

    // Return caregiver without password
    const { password, ...caregiverSafe } = caregiver;
    res.status(200).json({
      message: "Caregiver profile retrieved successfully",
      user: caregiverSafe,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    
    // Check if the authenticated user is trying to delete their own profile
    if (!req.user || req.user.id !== caregiverId) {
      res.status(403).json({ message: "Access denied. You can only delete your own profile." });
      return;
    }

    const userRepository = dataSource.getRepository<Caregiver>("caregiver");
    const user = await userRepository.findOne({ where: { caregiverId } });

    if (!user) {
      res.status(404).json({ message: "Caregiver not found" });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({ message: "Caregiver profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting caregiver:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get caregiver by ID (for admin use)
export const getCaregiverById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);

    if (!caregiverId) {
      res.status(400).json({ message: "Caregiver ID is required" });
      return;
    }

    const caregiverRepository = dataSource.getRepository<Caregiver>("caregiver");
    const caregiver = await caregiverRepository.findOne({
      where: { caregiverId },
    });

    if (!caregiver) {
      res.status(404).json({ message: "Caregiver not found" });
      return;
    }

    // Return caregiver without password
    const { password, ...caregiverSafe } = caregiver;
    res.status(200).json({
      message: "Caregiver retrieved successfully",
      user: caregiverSafe,
    });
  } catch (error) {
    console.error("Error getting caregiver by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};