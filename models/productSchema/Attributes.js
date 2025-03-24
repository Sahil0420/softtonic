import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const ProductAttributesSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

ProductAttributesSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "attributeid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!counter) {
      return next(new Error("Error generating attribute ID"));
    }
    this._id = counter.seq;
  } catch (error) {
    next(error);
  }
});



const ProductAttributesValuesSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    value: { type: String, required: true },
    attribute: { type: Number, ref: "ProductAttributes", required: true },
  },
  { timestamps: true }
);

ProductAttributesValuesSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    let counter = await Counter.findByIdAndUpdate(
      { _id: "attributevalueid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!counter) {
      return next(new Error("Error generating attribute value ID"));
    }
    this._id = counter.seq;
  } catch (error) {
    next(error);
  }
});

const ProductAttributesValues = mongoose.model("ProductAttributesValues", ProductAttributesValuesSchema);
const ProductAttributes = mongoose.model("ProductAttributes", ProductAttributesSchema);
export { ProductAttributes, ProductAttributesValues };
