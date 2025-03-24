import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    ref: "Users",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expire_time: {
    type: Date,
    required: true,
  },

  type: {
    type: String,
    enum: ["email_verification", "forgot_password"],
    required: true,
  },
});

const VerificationToken = mongoose.model(
  "VerificationTokens",
  VerificationTokenSchema
);

export default VerificationToken;
