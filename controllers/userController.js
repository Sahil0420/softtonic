import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import Users from "../models/dbSchema/Users.js";
import VerificationToken from "../models/dbSchema/VerificationToken.js";
import mailController from "./nodemailerController.js";
import OTP from "../models/dbSchema/Otps.js";

//using zod for validation
const userRegisterSchema = z.object({
  first_name: z.string().min(3),
  last_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone_number: z.string().min(10),
});

const userLoginSchema = z
  .object({
    email: z.string().email().optional(),
    phone_number: z.string().min(10).optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone_number, {
    message: "Either email or phone number must be provided",
  });

const userRegister = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number } =
      userRegisterSchema.parse(req.body);

    let checkEmail = await Users.findOne({ email_id: email });
    if (checkEmail) {
      return res.status(406).json({
        status: false,
        message: "Email is already associated with another account",
      });
    }

    const newUser = new Users({
      first_name,
      last_name,
      email_id: email,
      password,
      phone_number,
      role_id: userRole._id,
      last_login: null,
    });

    await newUser.save();

    //genrating verification token
    const verifyToken = crypto.randomBytes(4).toString("hex");
    const verificationToken = new VerificationToken({
      user_id: newUser._id,
      token: verifyToken,
      expire_time: new Date().getTime() + 30 * 60 * 1000,
      type: "email_verification",
    });

    await verificationToken.save();

    //send verification email
    await mailController({
      email: newUser.email_id,
      subject: "Account Created",
      body: `Hello , your new account has been created. Account details : <br/> <strong> Verify Token : </strong> ${verifyToken} <br/> Thank you!`,
    });

    return res
      .status(200)
      .json({ status: true, message: "Account created successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: false, message: error.errors });
    }
    return res.status(500).json({
      status: false,
      message: `Internal Server Error ---> ${error.message}`,
    });
  }
};

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone_number: z.string().min(10).optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone_number, {
    message: "Either email or phone number must be provided",
  });

const userLogin = async (req, res) => {
  try {
    const { email, phone_number, password } = loginSchema.parse(req.body);

    // Find user by email or phone number
    let user = email
      ? await Users.findOne({ email_id: email }).populate("role_id")
      : await Users.findOne({ phone_number }).populate("role_id");

    console.log(user)

    if (!user) {
      return res.status(403).json({ status: false, message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(406)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Generate JWT token with role-based claims
    const token = jwt.sign(
      { _id: user._id, role: user.role_id.role_slug },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      role: user.role_id.role_slug,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: false, message: error.errors });
    }
    return res
      .status(500)
      .json({ status: false, message: `Internal server error ${error.message}`});
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await Users.findOne({ email_id: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //generating otp
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 300000);

    const existingOtp = await OTP.findOne({ user_id: user._id });
    if (existingOtp) {
      existingOtp.otp = otpCode;
      existingOtp.expire_time = expireTime;
      await existingOtp.save();
    } else {
      const newOtp = new OTP({
        user_id: user._id,
        otp: otpCode,
        expire_time: expireTime,
      });

      await newOtp.save();
    }

    const verificationToken = new VerificationToken({
      user_id: user._id,
      token: crypto.createHash("sha256").update(otpCode).digest("hex"),
      expire_time: expireTime,
      type: "forgot_password",
    });

    await verificationToken.save();

    await mailController({
      email: user.email_id,
      subject: "Forgot Password Request",
      body: `Your password reset OTP is ${otpCode}. This OTP is valid for 5 minutes`,
    });

    res.json({ message: "Password Reset OTP sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: `Error sending password reset OTP ---> ${error.message}`,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const user = await Users.findOne({ email_id: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = req.body.otp;

    const existingOtp = await OTP.findOne({ user_id: user._id, otp: otpCode });
    if (!existingOtp || existingOtp.expire_time < new Date()) {
      return res.status(401).json({ message: "Invalid or expire OTP" });
    }

    const verificationToken = await VerificationToken.findOne({
      user_id: user._id,
      token: crypto.createHash("sha256").update(otpCode).digest("hex"),
      type: "forgot_password",
    });

    if (!verificationToken || verificationToken.expire_time < new Date()) {
      return res
        .status(401)
        .json({ message: "Invalid or expired verification token" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;

    console.log("token is " + token);

    const verificationToken = await VerificationToken.findOne({
      token,
      type: "forgot_password",
      expire_time: { $gt: new Date() },
    });

    if (!verificationToken) {
      return res
        .status(401)
        .json({ message: "Invalid or Expired password reset token" });
    }

    const user = await Users.findOne({ _id: verificationToken.user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = req.body.password;
    await user.save();

    await VerificationToken.findByIdAndDelete(verificationToken._id);

    res.json({ messsage: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const userId = req.user._id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;

    await user.save();

    res
      .status(200)
      .json({ status: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Change Password (for both Admin and User)
const changePassword = async (req, res) => {
  try {
    const { old_pass, new_pass, confirm_pass } = req.body;
    const userId = req.user._id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(old_pass, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    user.password = new_pass;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Profile (for both Admin and User)
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({ status: true, user });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export {
  userRegister,
  userLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};

/*

{
  "first_name" : "Yash",
  "last_name" : "YashKapoor",
  "email" : "cb99df76a4-171ad2+1@inbox.mailtrap.io",
  "password" : "password123",
  "phone_number" :"8978954747"
}

*/
