import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const productGallerySchema = new mongoose.Schema(
  {
    _id: { type: Number },
    product: { type: Number, ref: "Products", required: false },
    variant: { type: Number, ref: "ProductVariants", required: false },
    images: [{ type: String, required: true }],
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);


productGallerySchema.pre("validate", function (next) {
  if (!this.product && !this.variant) {
    return next(new Error("Either 'product' or 'variant' is required"));
  }
  if (this.product && this.variant) {
    return next(new Error("'product' and 'variant' cannot be set together"));
  }
  next();
});

// Auto-increment gallery ID
productGallerySchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "galleryid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred. Please try again"));
    }

    this._id = counter.seq;
  } catch (error) {
    console.log("Error in generating gallery ID");
    return next(error);
  }

  next();
});

const ProductGallery = mongoose.model("ProductGallery", productGallerySchema);
export default ProductGallery;
