import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const productVariantsSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    product: { type: Number, ref: "Products", required: true },
    sku: { type: String, unique: true, required: true }, // Added SKU
    price: { type: Number, required: true },
    sale_price: { type: Number }, // Added Sale Price
    percentage: { type: Number }, // Discount Percentage
    attributes: [{ type: Number, ref: "ProductAttributesValues" }],
    stock: { type: Number, required: true, default: 0 },
    variant_gallery: [{ type: Number, ref: "ProductGallery"}],
    feature_img: { type: String },
  },
  { timestamps: true }
);

// Auto-increment variant ID
productVariantsSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "variantid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred. Please try again"));
    }

    this._id = counter.seq;
  } catch (error) {
    console.log("Error in generating variant ID");
    return next(error);
  }

  //settng the frst image of the variant as feature image
  if (this.variant_gallery && this.variant_gallery.length > 0) {
    this.feature_img = this.variant_gallery[0];
  }

  // Calculate discount percentage if sale_price exists
  if (this.sale_price && this.price) {
    this.percentage = ((this.price - this.sale_price) / this.price) * 100;
  }

  next();
});

// Auto-update discount percentage when updating
productVariantsSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();

  if (
    update.$set &&
    update.$set.sale_price !== undefined &&
    update.$set.price !== undefined
  ) {
    update.$set.percentage =
      ((update.$set.price - update.$set.sale_price) / update.$set.price) * 100;
  }

  next();
});

const ProductVariants = mongoose.model(
  "ProductVariants",
  productVariantsSchema
);

export default ProductVariants;
