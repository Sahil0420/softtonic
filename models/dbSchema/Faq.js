import mongoose from "mongoose";
import Counter from "./Counter.js";

const FaqSchema = mongoose.Schema(
  {
    _id: { type: Number },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

FaqSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "faqid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      return next(new Error("Error generating blog id"));
    }

    this._id = counter.seq;
  } catch (error) {
    return next(error);
  }
  next();
});

const Faqs = mongoose.model("Faqs", FaqSchema);
export default Faqs;
