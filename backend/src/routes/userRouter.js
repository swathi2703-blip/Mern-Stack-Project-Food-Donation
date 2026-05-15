import express from "express";
import { setUserRole } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.patch("/role", protect, setUserRole);

export default router;
