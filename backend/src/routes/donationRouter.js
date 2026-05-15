import express from "express";
import { 
  createDonation, 
  getMyDonations, 
  deleteDonation, 
  getDonationFeed, 
  claimDonation 
} from "../controllers/donationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonation);
router.get("/my-posts", protect, getMyDonations);
router.delete("/:id", protect, deleteDonation);
router.get("/feed", protect, getDonationFeed);
router.patch("/claim/:id", protect, claimDonation);

export default router;
