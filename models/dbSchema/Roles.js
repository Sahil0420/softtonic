import mongoose from "mongoose";
import Counter from "./Counter.js";

const RoleSchema = new mongoose.Schema({
  _id: { type: Number },
  role_name: { type: String, required: true },
  role_slug: { type: String, unique: true },
  isDefault: { type: Boolean, default: false },
  createdBy: {
    type: Boolean,
    default: false,
  },
  timestamp: { type: Date, default: Date.now },
});

RoleSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "roleid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }

  if (this.role_name && !this.role_slug) {
    this.role_slug = `_${this.role_name.toLowerCase().replace(/\s+/g, "_")}`;
  }

  if (this.isModified("role_name") && !this.role_slug) {
    this.role_slug = `_${this.role_name.toLowerCase().replace(/\s+/g, "_")}`;
  } else if (this.isModified("role_name") && this.role_slug) {
    this.role_slug = `_${this.role_name.toLowerCase().replace(/\s+/g, "_")}`;
  }

  next();
});

const Roles = mongoose.model("Roles", RoleSchema);

export default Roles;
