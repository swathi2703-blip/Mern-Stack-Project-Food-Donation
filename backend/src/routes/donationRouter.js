import express from "express";
import { 
  createDonation, 
  getMyDonations, 
  deleteDonation, 
  getDonationFeed, 
  claimDonation,
  getAssignedDonations,
  fulfillDonation,
  getVolunteerHistory
} from "../controllers/donationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonation);
router.get("/my-posts", protect, getMyDonations);
router.get("/volunteer-history", protect, getVolunteerHistory);
router.delete("/:id", protect, deleteDonation);
router.get("/feed", protect, getDonationFeed);
router.get("/assigned", protect, getAssignedDonations);
router.patch("/claim/:id", protect, claimDonation);
router.patch("/fulfill/:id", protect, fulfillDonation);

export default router;
