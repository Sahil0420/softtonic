import Users from "../models/dbSchema/Users.js";
import bcrypt from "bcryptjs";

const updateAdminProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const adminId = req.user._id;
    const admin = await Users.findById(adminId);

    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    admin.first_name = first_name || admin.first_name;
    admin.last_name = last_name || admin.last_name;

    await admin.save();

    res
      .status(200)
      .json({ status: true, message: "Profile updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { old_pass, new_pass, confirm_pass } = req.body;
    const adminId = req.user._id;
    const admin = await Users.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(old_pass, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Password do not match" });
    }

    admin.password = new_pass;

    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAmdinProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const admin = await Users.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ status: false, messag: "Admin not found" });
    }

    res.status(200).json({ status: true, admin });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export { updateAdminProfile, changeAdminPassword, getAmdinProfile };
