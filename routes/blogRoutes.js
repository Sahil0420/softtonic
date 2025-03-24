import express from "express";
import BlogCategoryController from "../controllers/blogCategoryController.js";
import BlogsController from "../controllers/blogsController.js";



const BlogCategoryRouter = express.Router();
const BlogRouter = express.Router();

// Blog categouries
BlogCategoryRouter.get("/", BlogCategoryController.getAllBlogCategories);
BlogCategoryRouter.get(
  "/:blog_category_id",
  BlogCategoryController.getBlogCategoryById
);

// blog routing
BlogRouter.get("/", BlogsController.getAllBlogs);
BlogRouter.get(
  "/get-blogs-by-category/:blog_category_id",
  BlogsController.getAllBlogsByCategoryId
);
BlogRouter.get("/:blog_id", BlogsController.getBlogById);



export { BlogCategoryRouter, BlogRouter };
