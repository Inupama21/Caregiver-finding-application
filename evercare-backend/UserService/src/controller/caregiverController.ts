import { Request, Response } from "express";
import dataSource from "../config/config";
import { Caregiver } from "../models/caregiver";

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

    if (!email || !district) {
      res.status(400).json({ message: "Required fields are mandatory" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const userRepository = dataSource.getRepository<Caregiver>("caregiver");

    const user = userRepository.create({
      caregiverName,
      phone,
      email,
      district,
      password,
      confirmPassword,
      idPhoto,
      caregiverPhoto,
    });

    await userRepository.save(user);

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
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

    // Find caregiver by email
    const caregiver = await caregiverRepository.findOne({ where: { email } });

    if (!caregiver) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Check password (in production, you should hash passwords)
    if (caregiver.password !== password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

     // Login successful - return caregiver data without password
    const {
      password: caregiverPassword,
      confirmPassword,
      ...caregiverWithoutPassword
    } = caregiver;

    console.log("=== CAREGIVER LOGIN DEBUG ===");
    console.log("Caregiver found:", caregiver);
    console.log("Caregiver without password:", caregiverWithoutPassword);
    console.log("caregiverId:", caregiverWithoutPassword.caregiverId);
    console.log("===========================");

    res.status(200).json({
      message: "Login successful",
      user: caregiverWithoutPassword,
    });
  } catch (error) {
     console.error("Error during caregiver login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  const caregiverId = Number(req.params.caregiverId);

  try {
    const userRepo = dataSource.getRepository<Caregiver>("caregiver");
    const user = await userRepo.findOne({ where: { caregiverId } });

    if (!user) {
      res.status(404).json({ message: "Can't find the caregiver profile!" });
      return;
    }

    // You should update user fields here from req.body before saving, example:
    // Object.assign(user, req.body);

    await userRepo.save(user);
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCaregiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const caregiverId = Number(req.params.caregiverId);
    const userRepository = dataSource.getRepository<Caregiver>("caregiver");
    const user = await userRepository.findOne({ where: { caregiverId } });

    if (!user) {
      res.status(404).json({ message: "Caregiver not found" });
      return;
    }

    await userRepository.remove(user);

    res
      .status(201)
      .json({ message: "Caregiver profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
