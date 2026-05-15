import Donation from "../models/donation.model.js";

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor)
export const createDonation = async (req, res) => {
  try {
    const { foodItem, quantity, location, description, donorContact, useByTime } = req.body;
    
    const donation = await Donation.create({
      donorId: req.user.id,
      foodItem,
      quantity,
      address: location,
      description,
      donorContact,
      useByTime: useByTime ? new Date(useByTime) : undefined,
      status: "Pending"
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user donations
// @route   GET /api/donations/my-posts
// @access  Private (Donor)
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id }).sort("-postedAt");
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor/Admin)
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only donor or admin can delete
    if (donation.donorId.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    await donation.deleteOne();
    res.status(200).json({ message: "Donation removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending donations for feed
// @route   GET /api/donations/feed
// @access  Private (Volunteer)
export const getDonationFeed = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "Pending" }).sort("-postedAt");
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim a donation
// @route   PATCH /api/donations/claim/:id
// @access  Private (Volunteer)
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "Pending") {
      return res.status(400).json({ message: "Donation already claimed or fulfilled" });
    }

    donation.status = "Assigned";
    await donation.save();

    res.status(200).json({ message: "Donation claimed successfully", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
