import mongoose from "mongoose";
import Counter from "./Counter.js";

const smtpSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    host: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

smtpSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { _id: "smtpid", seq: this._id ? { $ne: this._id } : { $gte: 0 } },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, runValidators: true }
      );

      if (!counter) {
        console.error("Race condition detected!");
        return next(new Error("Race condition occurred. Please try again."));
      }

      this._id = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const SMTP = mongoose.model("SMTP", smtpSchema);

export default SMTP;
