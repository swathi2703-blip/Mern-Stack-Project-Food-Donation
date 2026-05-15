import express from "express";
import { getPriorityTags, getBestMatch } from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/priority", protect, getPriorityTags);
router.get("/match/:donationId", protect, getBestMatch);

export default router;
