import Donation from "../models/donation.model.js";
import User from "../models/user.model.js";
import Assignment from "../models/assignment.model.js";

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const activeVolunteers = await User.countDocuments({ role: "Volunteer" });
    const fulfilledRequests = await Donation.countDocuments({ status: "Fulfilled" });

    res.status(200).json({
      totalDonations,
      activeVolunteers,
      fulfilledRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track all requests
// @route   GET /api/admin/tracker
export const getRequestTracker = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId", "name")
      .sort("-postedAt");

    // We can also fetch assignments to see matched volunteers
    const assignments = await Assignment.find()
      .populate("volunteerId", "name")
      .populate("donationId");

    res.status(200).json({ donations, assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
