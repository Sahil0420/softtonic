import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const CategorySchema = new mongoose.Schema(
  {
    _id: { type: Number },
    category_name: { type: String, required: true },
    category_slug: { type: String, unique: true },
    category_img: { type: String },
  },
  { timestamps: true }
);


CategorySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { _id: "categoryid" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, runValidators: true }
      );

      if (!counter) {
        console.error("Race condition detected!");
        return next(new Error("Race condition occurreed. Please try again"));
      }

      this._id = counter.seq;
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  //generate catefgory slug
  const slug = this.category_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_");

  this.category_slug = slug;
  next();
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
