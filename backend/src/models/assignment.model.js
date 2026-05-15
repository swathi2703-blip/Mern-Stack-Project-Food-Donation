import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donation",
    required: true,
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  urgency: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  distance: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: false,
  },
  matchedAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
