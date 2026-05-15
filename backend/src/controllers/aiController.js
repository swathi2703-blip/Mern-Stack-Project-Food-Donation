import Donation from "../models/donation.model.js";
import User from "../models/user.model.js";
import Assignment from "../models/assignment.model.js";

// @desc    Priority Tagging (AI Feature)
// @logic   High urgency if expires soon OR quantity is large
export const getPriorityTags = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "Pending" });
    
    const taggedDonations = donations.map(donation => {
      let urgency = "Low";
      const hoursToExpiry = (new Date(donation.useByTime) - new Date()) / (1000 * 60 * 60);

      if (hoursToExpiry < 3 || donation.quantity > 50) {
        urgency = "High";
      } else if (hoursToExpiry < 12 || donation.quantity > 20) {
        urgency = "Medium";
      }

      return { ...donation.toObject(), urgency };
    });

    res.status(200).json(taggedDonations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Best Volunteer Match (AI Feature)
// @logic   Matches based on distance (simplified) and past activity
export const getBestMatch = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);
    
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // 1. Find all active volunteers
    const volunteers = await User.find({ role: "Volunteer" });

    // 2. Fetch past activity (count assignments)
    const matches = await Promise.all(volunteers.map(async (volunteer) => {
      const activityCount = await Assignment.countDocuments({ volunteerId: volunteer._id });
      
      // Simplified distance calculation (random for demo or 0 for now)
      // In production, we would use $geoNear in MongoDB
      const distance = (Math.random() * 5).toFixed(1); 

      return {
        volunteerId: volunteer._id,
        name: volunteer.name,
        distance,
        activityCount,
        score: (1 / (parseFloat(distance) + 1)) + (activityCount * 0.1) // Scoring logic
      };
    }));

    // Sort by best score
    const bestMatches = matches.sort((a, b) => b.score - a.score).slice(0, 3);

    res.status(200).json(bestMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
