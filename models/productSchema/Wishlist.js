import mongoose from "mongoose";
import Counter from "../dbSchema/Counter.js";

const WishlistItemSchema = new mongoose.Schema({
  _id: { type: Number },
  product_id: { type: Number, ref: "Products", required: true },
  isDeleted: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
});

const UserHasWishlistSchema = new mongoose.Schema({
  _id: { type: Number },
  user_id: { type: Number, ref: "Users", required: true },
  wishlistItems: [{ type: Number, ref: "WishlistItem" }], // Store only IDs
  timestamp: { type: Date, default: Date.now },
});

UserHasWishlistSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "wishlistid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred. Please try again"));
    }

    this._id = counter.seq;
  } catch (error) {
    console.log("Error in generating wishlist id");
    return next(error);
  }

  next();
});

WishlistItemSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "wishlistitemid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, runValidators: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred. Please try again"));
    }

    this._id = counter.seq;
  } catch (error) {
    console.log("Error in generating wishlistItem id");
    return next(error);
  }
  next();
});

const UserHasWishlist = mongoose.model(
  "user_has_wishlist",
  UserHasWishlistSchema
);
const WishlistItem = mongoose.model("WishlistItem", WishlistItemSchema);
export { UserHasWishlist, WishlistItem };
