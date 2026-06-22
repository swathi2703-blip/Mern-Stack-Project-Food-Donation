import Donation from "../models/donation.model.js";
import Assignment from "../models/assignment.model.js";

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor)
export const createDonation = async (req, res) => {
  try {
    const { foodItem, quantity, location, description, donorContact, useByTime } = req.body;
    const expiryTime = new Date(useByTime);

    if (Number.isNaN(expiryTime.getTime()) || expiryTime <= new Date()) {
      return res.status(400).json({ message: "Use-by time must be in the future" });
    }
    
    const donation = await Donation.create({
      donorId: req.user.id,
      foodItem,
      quantity,
      address: location,
      description,
      donorContact,
      useByTime: expiryTime,
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

// @desc    Get volunteer assignment history
// @route   GET /api/donations/volunteer-history
// @access  Private (Volunteer)
export const getVolunteerHistory = async (req, res) => {
  try {
    if (req.user.role !== "Volunteer") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const assignments = await Assignment.find({ volunteerId: req.user.id })
      .populate({
        path: "donationId",
        populate: { path: "donorId", select: "name" }
      })
      .sort("-matchedAt");

    const history = assignments
      .filter((assignment) => assignment.donationId)
      .map((assignment) => ({
        assignmentId: assignment._id,
        donation: assignment.donationId,
        urgency: assignment.urgency,
        distance: assignment.distance,
        duration: assignment.duration,
        matchedAt: assignment.matchedAt,
      }));

    res.status(200).json(history);
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
    const donations = await Donation.find({
      status: "Pending",
      useByTime: { $gt: new Date() },
    }).sort("-postedAt");
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assigned donations for logged-in volunteer
// @route   GET /api/donations/assigned
// @access  Private (Volunteer)
export const getAssignedDonations = async (req, res) => {
  try {
    if (req.user.role !== "Volunteer") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const assignments = await Assignment.find({ volunteerId: req.user.id })
      .populate("donationId")
      .sort("-matchedAt");

    const assigned = assignments
      .filter((assignment) => assignment.donationId && assignment.donationId.status === "Assigned")
      .map((assignment) => ({
        ...assignment.donationId.toObject(),
        assignmentId: assignment._id,
        urgency: assignment.urgency,
        distance: assignment.distance,
        duration: assignment.duration,
        matchedAt: assignment.matchedAt,
      }));

    res.status(200).json(assigned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim a donation
// @route   PATCH /api/donations/claim/:id
// @access  Private (Volunteer)
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      useByTime: { $gt: new Date() },
    });
    const { distanceValue, durationValue, distanceText, durationText, urgency: reqUrgency } = req.body;

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or has expired" });
    }

    if (donation.status !== "Pending") {
      return res.status(400).json({ message: "Donation already claimed or fulfilled" });
    }

    donation.status = "Assigned";
    await donation.save();

    console.log("Donation marked as Assigned. Creating Assignment entry...");

    // Fallback urgency calculation if not provided by frontend
    let urgency = reqUrgency || "Medium";
    if (!reqUrgency && donation.useByTime && durationValue) {
      const timeLeft = (new Date(donation.useByTime).getTime() - Date.now()) / 1000;
      const buffer = timeLeft - durationValue;
      if (buffer < 1800) urgency = "High";
      else if (buffer > 7200) urgency = "Low";
    }

    try {
      const numericDistance = Number(distanceValue);
      const numericDuration = Number(durationValue);

      // Create an assignment record
      const newAssignment = await Assignment.create({
        donationId: donation._id,
        volunteerId: req.user.id,
        distance: Number.isFinite(numericDistance) ? numericDistance : 0,
        duration: Number.isFinite(numericDuration) ? numericDuration : 0,
        urgency,
        matchedAt: new Date()
      });
      console.log("Assignment created successfully:", newAssignment._id);
    } catch (assignError) {
      console.error("Error creating assignment record:", assignError);
      // We don't necessarily want to fail the whole request if assignment creation fails,
      // but in this case the user specifically wants it stored.
      throw assignError;
    }

    res.status(200).json({ message: "Donation claimed successfully", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark donation as fulfilled by the assigned volunteer
// @route   PATCH /api/donations/fulfill/:id
// @access  Private (Volunteer)
export const fulfillDonation = async (req, res) => {
  try {
    if (req.user.role !== "Volunteer") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "Assigned") {
      return res.status(400).json({ message: "Donation is not assigned" });
    }

    const assignment = await Assignment.findOne({
      donationId: donation._id,
      volunteerId: req.user.id,
    });

    if (!assignment) {
      return res.status(403).json({ message: "Not authorized" });
    }

    donation.status = "Fulfilled";
    await donation.save();

    res.status(200).json({ message: "Pickup completed successfully", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
