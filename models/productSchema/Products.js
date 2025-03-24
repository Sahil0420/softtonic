import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const ProductsSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    product_name: { type: String, required: true },
    product_slug: { type: String, unique: true },
    sku: {
      type: String,
      unique: true,
      required: function () {
        return this.type === "simple";
      },
    },
    long_description: { type: String, required: true },
    short_description: { type: String, required: true },
    feature_img: {
      type: String,
      required: function () {
        return this.type === "simple";
      },
    },
    category_id: { type: Number, ref: "Category", required: true },
    subcategory_id: { type: Number, ref: "Subcategory", required: true },
    product_gallery: { type: Number, ref: "ProductGallery" },
    type: { type: String, enum: ["simple", "variant"], required: true },
    price: {
      type: Number,
      required: function () {
        return this.type === "simple";
      },
    },
    sale_price: {
      type: Number,
      required: function () {
        return this.type === "simple";
      },
    },
    percentage: { type: Number },
    attributes: [
      {
        type: Number,
        ref: "ProductAttributes",
        required: function () {
          return this.type === "variant";
        },
      },
    ],
    variants: [{ type: Number, ref: "ProductVariants" }],
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// counter for auto increament using pre save hook
ProductsSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "productid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred. Please try again"));
    }

    this._id = counter.seq;
  } catch (error) {
    console.error("Error in generating product ID");
    return next(error);
  }

  // Generate Slug
  this.product_slug = this.product_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_");

  if (this.sale_price && this.price) {
    this.percentage = Math.round(
      ((this.price - this.sale_price) / this.price) * 100
    );
  }
  next();
});

//product_sluh and discount on Update
ProductsSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.$set) {
    if (update.$set.product_name) {
      update.$set.product_slug = update.$set.product_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_");
    }

    const query = this.getQuery();
    if (!query) return next(new Error("Invalid product query"));

    const existingProduct = await this.model.findOne(query);
    if (!existingProduct) return next(new Error("Product not found"));

    if (!existingProduct) {
      return next(new Error("Product not found"));
    }

    const price = update.$set.price ?? existingProduct.price;
    const sale_price = update.$set.sale_price ?? existingProduct.sale_price;

    if (
      this.price &&
      typeof this.sale_price === "number" &&
      this.sale_price < this.price
    ) {
      this.percentage = Math.round(
        ((this.price - this.sale_price) / this.price) * 100
      );
    } else {
      this.percentage = 0;
    }
  }

  next();
});

const Products = mongoose.model("Products", ProductsSchema);
export default Products;
