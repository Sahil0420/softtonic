import mongoose from "mongoose";
import Counter from "./Counter.js";
import Products from "../productSchema/Products.js";


const cartSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    user_id: { type: Number, ref: "Users" },
    items: [
      {
        product_id: { type: Number, ref: "Products" },
        quantity: Number,
        image_url: String,
        added_at: Date,
      },
    ],
  },
  { timestamps: true }
);

cartSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "cartid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }

  const lastItem = this.items[this.items.length - 1];

  if (lastItem && !lastItem.image_url) {
    const product = await Products.findById(lastItem.product_id);
    if (product) {
      lastItem.image_url = product.feature_img || "default-image.jpg";
    }
  }

  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
