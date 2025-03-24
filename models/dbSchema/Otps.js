import mongoose from "mongoose";
import Counter from "./Counter.js";

const otpSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      ref: "Users",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expire_time: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { _id: "otpid"},
        { $inc: { seq: 1 } },
        { new: true, upsert: true, runValidators: true }
      );

      if (!counter) {
        console.error("Race condition detected!");
        return next(new Error("Race condition occurred , Please try again"));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
