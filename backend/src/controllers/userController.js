import User from "../models/user.model.js";

export const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;
    if (!["Donor", "Volunteer"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.status(200).json({ message: "Role updated successfully", role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
