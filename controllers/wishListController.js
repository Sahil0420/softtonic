import Users from "../models/dbSchema/Users.js";
import jwt from "jsonwebtoken"
import {
  UserHasWishlist,
  WishlistItem,
} from "../models/productSchema/Wishlist.js";

const addToWishlist = async (req, res) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = await Users.findById(decoded._id);


    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Session has expired please login again" });
    }

    const { product_id } = req.body;

    let wishlist = await UserHasWishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = new UserHasWishlist({ user_id, wishlistItems: [] });
      await wishlist.save();
    }

    const existingItem = await WishlistItem.findOne({
      _id: { $in: wishlist.wishlistItems },
      product_id,
      isDeleted: false,
    });

    if (existingItem) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const wishlistItem = new WishlistItem({ product_id });
    await wishlistItem.save();

    wishlist.wishlistItems.push(wishlistItem._id);
    await wishlist.save();

    res.status(201).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `"Server Error" : "${error}"` });
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = await Users.findById(decoded._id);


    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Session has expired please login again" });
    }

    const wishlist = await UserHasWishlist.findOne({ user_id }).populate({
      path: "wishlistItems",
      populate: { path: "product_id" },
    });

    if (!wishlist) {
      return res.json([]);
    }

    const activeWishlistItems = wishlist.wishlistItems.filter(
      (item) => !item.isDeleted
    );

    res.json(activeWishlistItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const wishlist = await UserHasWishlist.findOne({ user_id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const wishlistItem = await WishlistItem.findOneAndUpdate(
      { _id: { $in: wishlist.wishlistItems }, product_id },
      { isDeleted: true },
      { new: true }
    );

    if (!wishlistItem) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


export { addToWishlist, removeFromWishlist, getUserWishlist };
