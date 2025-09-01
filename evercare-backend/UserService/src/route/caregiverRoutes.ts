import express from "express";
import {
  deleteCaregiver,
  registerCaregiver,
  updateCaregiver,
  loginCaregiver,
} from "../controller/caregiverController";

const router = express.Router();

router.post("/", registerCaregiver);
router.put("/:caregiverId", updateCaregiver);
router.post("/login", loginCaregiver);
router.delete("/:caregiverId", deleteCaregiver);

export default router;
