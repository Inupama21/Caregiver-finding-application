import { Request, Response } from "express";
import dataSource from "../config/config";
import { CareseekerProfile } from "../models/careseekerProfile";

interface CreateProfileBody {
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
}

interface UpdateProfileBody extends Partial<CreateProfileBody> {}

interface AddReviewBody {
  rating: number;
  feedback?: string;
}

// Create or update careseeker profile
export const createOrUpdateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      careseekerId,
      about,
      careType, // Add careType
      careExperience,
      budgetRange,
      location,
      urgency,
      healthConditions,
      careRequirements,
      careTasksNeeded,
      preferredGender,
      languages,
    } = req.body as CreateProfileBody;

    console.log("Received profile data:", req.body); // Add logging

    if (!careseekerId) {
      res.status(400).json({ message: "Careseeker ID is required" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");

    // Check if profile already exists
    let existingProfile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (existingProfile) {
      // Update existing profile
      existingProfile.about = about ?? existingProfile.about;
      existingProfile.careType = careType ?? existingProfile.careType; // Add careType
      existingProfile.careExperience =
        careExperience ?? existingProfile.careExperience;
      existingProfile.budgetRange = budgetRange ?? existingProfile.budgetRange;
      existingProfile.location = location ?? existingProfile.location;
      existingProfile.urgency = urgency ?? existingProfile.urgency;
      existingProfile.healthConditions =
        healthConditions ?? existingProfile.healthConditions;
      existingProfile.careRequirements =
        careRequirements ?? existingProfile.careRequirements;
      existingProfile.careTasksNeeded =
        careTasksNeeded ?? existingProfile.careTasksNeeded;
      existingProfile.preferredGender =
        preferredGender ?? existingProfile.preferredGender;
      existingProfile.languages = languages ?? existingProfile.languages;

      const updatedProfile = await profileRepository.save(existingProfile);
      res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } else {
      // Create new profile
      const newProfile = profileRepository.create({
        careseekerId,
        about,
        careType, // Add careType
        careExperience,
        budgetRange,
        location,
        urgency,
        healthConditions,
        careRequirements,
        careTasksNeeded,
        preferredGender,
        languages,
        overallRating: 0,
        totalReviews: 0,
      });

      const savedProfile = await profileRepository.save(newProfile);
      res.status(201).json({
        message: "Profile created successfully",
        profile: savedProfile,
      });
    }
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get careseeker profile by careseeker ID
export const getProfileByCareseekerID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);

    if (!careseekerId) {
      res.status(400).json({ message: "Invalid careseeker ID" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update specific sections of the profile
export const updateAboutSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);
    const { about, careType, careExperience, budgetRange, location, urgency } =
      req.body;

    console.log(
      "Updating about section for careseeker:",
      careseekerId,
      req.body
    ); // Add logging

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    profile.about = about ?? profile.about;
    profile.careType = careType ?? profile.careType; // Add careType
    profile.careExperience = careExperience ?? profile.careExperience;
    profile.budgetRange = budgetRange ?? profile.budgetRange;
    profile.location = location ?? profile.location;
    profile.urgency = urgency ?? profile.urgency;

    const updatedProfile = await profileRepository.save(profile);
    res.status(200).json({
      message: "About section updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating about section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMedicalSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);
    const { healthConditions, careRequirements, careTasksNeeded } = req.body;

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    profile.healthConditions = healthConditions ?? profile.healthConditions;
    profile.careRequirements = careRequirements ?? profile.careRequirements;
    profile.careTasksNeeded = careTasksNeeded ?? profile.careTasksNeeded;

    const updatedProfile = await profileRepository.save(profile);
    res.status(200).json({
      message: "Medical section updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating medical section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePreferencesSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);
    const { preferredGender, languages } = req.body;

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    profile.preferredGender = preferredGender ?? profile.preferredGender;
    profile.languages = languages ?? profile.languages;

    const updatedProfile = await profileRepository.save(profile);
    res.status(200).json({
      message: "Preferences section updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating preferences section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add or update rating/review
export const updateRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);
    const { rating } = req.body as AddReviewBody;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    // Calculate new overall rating
    const currentTotal =
      (profile.overallRating || 0) * (profile.totalReviews || 0);
    const newTotalReviews = (profile.totalReviews || 0) + 1;
    const newOverallRating = (currentTotal + rating) / newTotalReviews;

    profile.overallRating = Math.round(newOverallRating * 100) / 100; // Round to 2 decimal places
    profile.totalReviews = newTotalReviews;

    const updatedProfile = await profileRepository.save(profile);
    res.status(200).json({
      message: "Rating updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete careseeker profile
export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const careseekerId = Number(req.params.careseekerId);

    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profile = await profileRepository.findOne({
      where: { careseekerId },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    await profileRepository.remove(profile);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all careseeker profiles (for admin or search purposes)
export const getAllProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profileRepository =
      dataSource.getRepository<CareseekerProfile>("careseeker_profile");
    const profiles = await profileRepository.find({
      order: { createdAt: "DESC" },
    });

    res.status(200).json({
      message: "Profiles retrieved successfully",
      profiles,
      count: profiles.length,
    });
  } catch (error) {
    console.error("Error getting all profiles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
