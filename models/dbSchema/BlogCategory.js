import mongoose from "mongoose";
import Counter from "./Counter.js";

const BlogCategorySchema = new mongoose.Schema(
  {
    _id: { type: Number },
    category_name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    image: { type: String },
  },
  { timestamps: true }
);

BlogCategorySchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "blogcategoryid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      return next(new Error("Error generating blog category ID"));
    }

    this._id = counter.seq;
  } catch (error) {
    return next(error);
  }

  next();
});

BlogCategorySchema.pre("save", function (next) {
  if (this.isModified("category_name")) {
    this.slug = this.category_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

const BlogCategory = mongoose.model("BlogCategory", BlogCategorySchema);
export default BlogCategory;
