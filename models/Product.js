import mongoose from "mongoose";

const productAttributesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
});

productAttributesSchema.pre("save", function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^-|-$)/g, "");
  next();
});

const productAttributesValuesSchema = new mongoose.Schema(
  {
    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductAttribute",
      required: true,
    },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

const productVariants = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  price: { type: Number, required: true },
  attributes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ProductAttributesValues" },
  ],
});

const productVariantAttributeSchema = new mongoose.Schema(
  {
    variants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariants",
      required: true,
    },
    attribute_value: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductAttributesValues",
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  type: { type: String, enum: ["simple", "variant"], required: true },
  price: {
    type: Number,
    required: function () {
      return this.type === "simple";
    },
  },
  content: { type: String },
  attributes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ProductAttributes" },
  ],
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductVariants" }],
});

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_") // Replace non-alphanumeric characters with dashes
    .replace(/(^-|-$)/g, ""); // Remove leading and trailing dashes
}

productSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = generateSlug(this.name);
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
export const ProductAttributes = mongoose.model(
  "ProductAttributes",
  productAttributesSchema
);
export const ProductAttributesValues = mongoose.model(
  "ProductAttributesValues",
  productAttributesValuesSchema
);
export const ProductVariants = mongoose.model(
  "ProductVariants",
  productVariants
);
export const ProductVariantAttribute = mongoose.model(
  "ProductVariantAttribute",  
  productVariantAttributeSchema
);
