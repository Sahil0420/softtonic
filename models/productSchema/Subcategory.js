import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const SubcategorySchema = new mongoose.Schema(
  {
    _id: { type: Number },
    subcategory_name: { type: String },
    subcategory_slug: { type: String, unique: true },
    subcategory_img: { type: String },
    category_id: { type: Number, ref: "Category", required: true },
  },
  { timestamps: true }
);

SubcategorySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      let counter = await Counter.findOneAndUpdate(
        { _id: "subcategoryid" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, runValidators: true }
      );

      if (!counter) {
        console.error("Race condition detected");
        return next(new Error("Race condition occurred. Please try again"));
      }

      this._id = counter.seq;
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  //generate slug
  const slug = this.subcategory_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_");

  this.subcategory_slug = slug;

  next();

});

const Subcategory = mongoose.model("Subcategory", SubcategorySchema);
export default Subcategory;
