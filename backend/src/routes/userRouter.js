import express from "express";
import { getProfile, setUserRole } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.patch("/role", protect, setUserRole);

export default router;
