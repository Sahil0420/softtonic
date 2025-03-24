import mongoose from "mongoose";
import Counter from "./Counter.js";

const BlogTagsSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String },
  },
  { timestamps: true }
);

BlogTagsSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "blogtagid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      return next(new Error("Error generating blog tag Id"));
    }

    this._id = counter.seq;
  } catch (error) {
    return next(error);
  }
  next();
});

const BlogTags = mongoose.model("BlogTags", BlogTagsSchema);
export default BlogTags;
