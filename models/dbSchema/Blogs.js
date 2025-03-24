import mongoose from "mongoose";
import Counter from "./Counter.js";

const BlogsSchema = new mongoose.Schema({
  _id: { type: Number },
  blog_category_id: [{ type: Number, ref: "BlogCategory", required: true }],
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  feature_img: { type: String },
  blog_tags: [{ type: Number, ref: "BlogTags", required: true }],
});

BlogsSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "blogid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      return next(new Error("Error generating blog Id"));
    }

    this._id = counter.seq;
  } catch (error) {
    return next(error);
  }
  next();
});

const Blogs = mongoose.model("Blogs", BlogsSchema);
export default Blogs;
