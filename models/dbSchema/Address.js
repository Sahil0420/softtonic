import mongoose from "mongoose";
import Counter from "./Counter.js";

const AddressSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    user_id: { type: Number, ref: "Users", required: true },

    billing_address: {
      pin_code: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },

    shipping_address: {
      pin_code: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
  },
  { timestamps: true }
);

AddressSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "addressid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this._id = counter.seq;

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred in address"));
    }
  } catch (error) {
    console.log("Error in generating Address ID");
    return next(error);
  }
  next();
});

const Address = mongoose.model("Address", AddressSchema);

export default Address;
