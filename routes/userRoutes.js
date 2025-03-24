import express from "express";
import {
  userRegister,
  userLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} from "../controllers/wishListController.js";

import AddressController from "../controllers/addressController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (No authentication required)
router.post("/user/register", userRegister);
router.post("/user/login", userLogin);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/verify-otp", verifyOtp);
router.patch("/user/reset-password/:token", resetPassword);

// Protected routes (Require authentication)
router.get("/user/profile", authenticate, getProfile);
router.patch("/user/update-profile", authenticate, updateProfile);
router.patch("/user/change-password", authenticate, changePassword);

//Wishlist routes
router.post("/user/wishlist/add/:token", authenticate, addToWishlist);
router.patch("/user/wishlist/remove", authenticate, removeFromWishlist);
router.get("/user/wishlist/:token", authenticate, getUserWishlist);

//address routes
router.post("/user/address", authenticate, AddressController.createAddress);
router.get("/user/address/", authenticate, AddressController.getAllAddresses);
router.patch("/user/address/:addressid", authenticate, AddressController.updateAddress);
router.delete("/user/address/:addressid", authenticate, AddressController.deleteAddress);
export default router;
