import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Counter from "./Counter.js";

const UserSchema = new mongoose.Schema({
  _id: { type: Number },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email_id: { type: String, required: true  , unique: true},
  password: { type: String, required: true },
  phone_number: { type: String , unique : true},
  role_id: {
    type: Number,
    ref: "Roles",
    required: true,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  last_login: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  // This function will check whether the user is new
  // if new then unique custom id (with auto increment) will be generated for the user

  this.first_name = this.first_name.toLowerCase();
  this.last_name = this.last_name.toLowerCase();
  
  if (this.isNew) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { _id: "userid" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, runValidators: true }
      );

      if (!counter) {
        // Race condition detected! Retry or handling
        console.error("Race condition detected!");
        return next(new Error("Race condition occurred. Please try again."));
      }

      this._id = counter.seq;
    } catch (error) {
      return next(error);
    }
  }

  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Users", UserSchema);
