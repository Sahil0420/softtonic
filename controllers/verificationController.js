import VerificationToken from "../models/dbSchema/VerificationToken";
import Users from "../models/dbSchema/Users";

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res
        .status(404)
        .json({ status: false, message: "Verification token not found" });
    }

    if (verificationToken.expire_time < new Date().getTime()) {
      return res
        .status(400)
        .json({ status: false, message: "Verification token has expired" });
    }

    const user = await Users.findById(verificationToken.user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.email_verified = true;
    await user.save();

    res
      .status(200)
      .json({ status: true, message: "Email verified successfully" });
  } catch (error) {
    console.error(
      `server error during email verification --> ${error.message}`
    );
    return res
      .status(500)
      .json({
        status: false,
        message: "Interval Server Error during email verification",
      });
  }
};

export default verifyEmail;