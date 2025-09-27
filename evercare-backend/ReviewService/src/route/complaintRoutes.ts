import { Router } from "express";
import { ComplaintController } from "../controller/complaintController";

const router = Router();
const complaintController = new ComplaintController();

// Create a new complaint
router.post("/complaints", complaintController.createComplaint);

// Get all complaints (for admin)
router.get("/complaints", complaintController.getAllComplaints);

// Get all complaints for a specific careseeker
router.get(
  "/complaints/careseeker/:careseekerId",
  complaintController.getCareseekerComplaints
);

// Get all complaints for a specific caregiver
router.get(
  "/complaints/caregiver/:caregiverId",
  complaintController.getCaregiverComplaints
);

// Get specific complaint by ID
router.get(
  "/complaints/:complaintId",
  complaintController.getComplaintById
);

// Update complaint status (admin only)
router.put(
  "/complaints/:complaintId/status",
  complaintController.updateComplaintStatus
);

// Delete a complaint
router.delete(
  "/complaints/:complaintId",
  complaintController.deleteComplaint
);

export default router;
