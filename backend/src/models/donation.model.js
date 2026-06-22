import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  foodItem: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  donorContact: {
    type: String,
    required: true,
  },
  useByTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "Fulfilled"],
    default: "Pending",
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

donationSchema.index({ address: "text" });
// MongoDB deletes a donation automatically once its use-by time has passed.
donationSchema.index({ useByTime: 1 }, { expireAfterSeconds: 0 });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
