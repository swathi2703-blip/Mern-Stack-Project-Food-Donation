import express from "express";
import { getAdminStats, getRequestTracker } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Middleware to restrict access to Admins
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/tracker", protect, adminOnly, getRequestTracker);

export default router;
