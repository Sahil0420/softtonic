import BlogCategory from "../models/dbSchema/BlogCategory.js";
import { z } from "zod";

const blogCategorySchema = z.object({
  category_name: z
    .string()
    .min(3, "Category name should be at least 3 characters"),
  image: z.string().optional().nullable(),
});

const blogCategoryUpdateSchema = z.object({
  blog_category_id: z.number().int().positive(),
  category_name: z
    .string()
    .min(3, "Category name should be at least 3 characters")
    .optional(),
  image: z.string().optional(),
});

class BlogCategoryController {
  async addBlogCategory(req, res) {
    try {
      const { body } = req;
      const checkImage = req.file ? req.file.path : null;
      body.image = checkImage;

      const result = blogCategorySchema.safeParse(body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: `Invalid request data ${result.error}` });
      }

      const { category_name } = result.data;
      const newCategory = new BlogCategory({ category_name , ...result.data});
      await newCategory.save();
      res
        .status(201)
        .json({ message: "Category created successfully", newCategory });
    } catch (error) {
      res.status(400).json({ message: `Blog Error : ${error.message}` });
    }
  }

  // get all blog categories
  async getAllBlogCategories(req, res) {
    try {
      const categories = await BlogCategory.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: `Error : ${error.message}` });
    }
  }

  async getBlogCategoryById(req, res) {
    try {
      let { blog_category_id } = req.params;
      blog_category_id = Number(blog_category_id);
      const category = await BlogCategory.findById(blog_category_id);

      if (!category)
        return res.status(404).json({ message: "Category not found" });

      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: `Error : ${error.message}` });
    }
  }

  async updateBlogCategory(req, res) {
    try {
      const {body} = req;
      const blog_category_id = Number(req?.params?.blog_category_id);
      const checkImage = req.file ? req.file.path : null;
      body.image = checkImage;
      body.blog_category_id = blog_category_id;
      console.log("Body : ", body)
      const result = blogCategoryUpdateSchema.safeParse(body);

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid request data", error: result.error });
      }

      const { category_name, image } = result.data;
      const updateCategory = await BlogCategory.findByIdAndUpdate(
        blog_category_id,
        { category_name, image },
        { new: true, runValidators: true }
      );

      if (!updateCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res
        .status(200)
        .json({ message: "Category updated successfully", updateCategory });
    } catch (error) {
      res.status(500).json({ message: `Error : ${error.message}` });
    }
  }

  async deleteBlogCategory(req, res) {
    try {
      const blog_category_id = Number(req?.params?.blog_category_id);
      const deletedCategory = await BlogCategory.findByIdAndDelete(
        blog_category_id
      );

      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error  : ${error.message}` });
    }
  }
}

export default new BlogCategoryController();
