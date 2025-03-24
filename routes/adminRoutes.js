import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import BlogsController from "../controllers/blogsController.js";
import BlogCategoryController from "../controllers/blogCategoryController.js";

import {
  addProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  deleteCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  addCategory,
} from "../controllers/categoryController.js";

import {
  addSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";

import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import {
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import {
  deleteAttribute,
  getAllAttributes,
  getAttributeByProductId,
  updateAttribute,
} from "../controllers/attributesController.js";

import upload from "../config/multerConfig.js";
import FaqController from "../controllers/faqController.js";


const authenticatedRouter = express.Router();
authenticatedRouter.use(authenticate); // Authenticate first
authenticatedRouter.use(adminAuthMiddleware); // Then check if admin

//admin profile update
authenticatedRouter.get("/profile", getProfile);
authenticatedRouter.patch("/update-profile", updateProfile);
authenticatedRouter.patch("/change-password", changePassword);

// Role Management
authenticatedRouter.post("/add-role", createRole);
authenticatedRouter.get("/get-all-roles", getRoles);
authenticatedRouter.get("/get-role/:id", getRoleById);
authenticatedRouter.patch("/update-role/:id", updateRole);
authenticatedRouter.delete("/delete-role/:id", deleteRole);

// Category Management
authenticatedRouter.post(
  "/add-category",
  upload.single("category_img"),
  addCategory
);
authenticatedRouter.get("/get-all-categories", getAllCategories);
authenticatedRouter.get("/get-category/:id", getCategoryById);
authenticatedRouter.patch(
  "/update-category/:id",
  upload.single("category_img"),
  updateCategory
);
authenticatedRouter.delete("/delete-category/:id", deleteCategory);

// Subcategory Management
authenticatedRouter.post(
  "/add-subcategory",
  upload.single("subcategory_img"),
  addSubcategory
);
authenticatedRouter.get("/get-all-subcategories", getAllSubcategories);
authenticatedRouter.get("/get-subcategory/:id", getSubcategoryById);
authenticatedRouter.patch(
  "/update-subcategory/:id",
  upload.single("subcategory_img"),
  updateSubcategory
);

authenticatedRouter.delete("/delete-subcategory/:id", deleteSubcategory);

// Product Management
authenticatedRouter.post(
  "/add-product",
  upload.fields([
    { name: "feature_img", maxCount: 1 },
    { name: "product_gallery", maxCount: 8 }, // change it later accordin to neeed
    { name: "variant_gallery", maxCount: 8 },
  ]),
  addProduct
);

authenticatedRouter.get("/get-all-products", getAllProducts);
authenticatedRouter.get("/get-product/:id", getProductById);
authenticatedRouter.patch(
  "/update-product/:id",
  upload.fields([
    { name: "feature_img", maxCount: 1 },
    { name: "product_gallery", maxCount: 8 }, // change it later accordin to neeed
    { name: "variant_gallery", maxCount: 8 },
  ]),
  updateProduct
);
authenticatedRouter.delete("/delete-product/:id", deleteProduct);

//Attributes Controller routes
authenticatedRouter.get("/get-all-attributes", getAllAttributes);
authenticatedRouter.get("/get-attribute-by-pid/:id", getAttributeByProductId);
authenticatedRouter.patch("/update-attribute/:id", updateAttribute);
authenticatedRouter.delete("/delete-attribute/:id", deleteAttribute);

// blogs category and blog admin access routes
authenticatedRouter.post(
  "/blog-categories/add",
  upload.single("image"),
  BlogCategoryController.addBlogCategory
);
authenticatedRouter.patch(
  "/blog-categories/:blog_category_id",
  upload.single("image"),
  BlogCategoryController.updateBlogCategory
);
authenticatedRouter.delete(
  "/blog-categories/:blog_category_id",
  BlogCategoryController.deleteBlogCategory
);

authenticatedRouter.post(
  "/blogs/add-blog",
  upload.single("feature_img"),
  BlogsController.addBlog
);

authenticatedRouter.patch(
  "/blogs/update/:blog_id",
  upload.single("feature_img"),
  BlogsController.updateBlog
);
authenticatedRouter.delete("/admin/delete/:blog_id", BlogsController.deleteBlog);

// faq routes
authenticatedRouter.post("/faq/add" , FaqController.addfaq);
authenticatedRouter.get("/faq/" , FaqController.getAllFaqs);
authenticatedRouter.delete("/faq/delete/:id", FaqController.deleteFaq);

const mainRouter = express.Router();
mainRouter.use("/admin", authenticatedRouter);

export default mainRouter;

