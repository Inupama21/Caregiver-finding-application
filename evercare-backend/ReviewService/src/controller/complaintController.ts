import { Request, Response } from "express";
import datasource from "../config/config";
import { Complaint, ComplaintEntity } from "../models/complaint";
import { Repository } from "typeorm";

export class ComplaintController {
  private complaintRepository: Repository<Complaint>;

  constructor() {
    this.complaintRepository = datasource.getRepository(ComplaintEntity);
  }

  // Create a new complaint
  createComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId, careseekerId, subject, description, priority = 'medium' } = req.body;

      // Validate input
      if (!caregiverId || !careseekerId || !subject || !description) {
        res.status(400).json({
          error: "Missing required fields: caregiverId, careseekerId, subject, description",
        });
        return;
      }

      if (subject.length > 255) {
        res.status(400).json({
          error: "Subject must be 255 characters or less",
        });
        return;
      }

      if (!['low', 'medium', 'high'].includes(priority)) {
        res.status(400).json({
          error: "Priority must be low, medium, or high",
        });
        return;
      }

      // Create new complaint
      const newComplaint = this.complaintRepository.create({
        caregiverId,
        careseekerId,
        subject,
        description,
        priority,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedComplaint = await this.complaintRepository.save(newComplaint);

      res.status(201).json({
        message: "Complaint submitted successfully",
        complaint: savedComplaint,
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all complaints for a specific careseeker
  getCareseekerComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      const { careseekerId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      if (!careseekerId) {
        res.status(400).json({ error: "Careseeker ID is required" });
        return;
      }

      const [complaints, total] = await this.complaintRepository.findAndCount({
        where: { careseekerId: parseInt(careseekerId) },
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      });

      res.status(200).json({
        complaints,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching careseeker complaints:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all complaints for a specific caregiver
  getCaregiverComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      const { caregiverId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      if (!caregiverId) {
        res.status(400).json({ error: "Caregiver ID is required" });
        return;
      }

      const [complaints, total] = await this.complaintRepository.findAndCount({
        where: { caregiverId: parseInt(caregiverId) },
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      });

      res.status(200).json({
        complaints,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching caregiver complaints:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all complaints (for admin)
  getAllComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [complaints, total] = await this.complaintRepository.findAndCount({
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      });

      res.status(200).json({
        complaints,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching all complaints:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get specific complaint by ID
  getComplaintById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { complaintId } = req.params;

      if (!complaintId) {
        res.status(400).json({ error: "Complaint ID is required" });
        return;
      }

      const complaint = await this.complaintRepository.findOne({
        where: { complaintId: parseInt(complaintId) },
      });

      if (!complaint) {
        res.status(404).json({ message: "Complaint not found" });
        return;
      }

      res.status(200).json({ complaint });
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Update complaint status (admin only)
  updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { complaintId } = req.params;
      const { status, adminNotes } = req.body;

      if (!complaintId) {
        res.status(400).json({ error: "Complaint ID is required" });
        return;
      }

      if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
        res.status(400).json({
          error: "Status must be pending, in_progress, resolved, or closed",
        });
        return;
      }

      const complaint = await this.complaintRepository.findOne({
        where: { complaintId: parseInt(complaintId) },
      });

      if (!complaint) {
        res.status(404).json({ message: "Complaint not found" });
        return;
      }

      complaint.status = status;
      complaint.updatedAt = new Date();
      
      if (adminNotes) {
        complaint.adminNotes = adminNotes;
      }

      if (status === 'resolved' || status === 'closed') {
        complaint.resolvedAt = new Date();
      }

      const updatedComplaint = await this.complaintRepository.save(complaint);

      res.status(200).json({
        message: "Complaint status updated successfully",
        complaint: updatedComplaint,
      });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Delete a complaint (only the careseeker who created it can delete)
  deleteComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
      const { complaintId } = req.params;

      if (!complaintId) {
        res.status(400).json({ error: "Complaint ID is required" });
        return;
      }

      const complaint = await this.complaintRepository.findOne({
        where: { complaintId: parseInt(complaintId) },
      });

      if (!complaint) {
        res.status(404).json({ message: "Complaint not found" });
        return;
      }

      await this.complaintRepository.remove(complaint);

      res.status(200).json({ message: "Complaint deleted successfully" });
    } catch (error) {
      console.error("Error deleting complaint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
