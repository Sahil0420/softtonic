import Blogs from "../models/dbSchema/Blogs.js";
import BlogCategory from "../models/dbSchema/BlogCategory.js";
import BlogTags from "../models/dbSchema/BlogTags.js";
import { z } from "zod";

const BlogSchema = z.object({
  blog_category_id: z.array(z.number().int().positive()),
  title: z.string().min(1, "Title can't be empty"),
  excerpt: z.string().min(1, "Excerpt can't be empty"),
  content: z.string().min(1, "Content can't be empty"),
  feature_img: z.string().optional().nullable(),
  blog_tags: z.array(z.string()),
});

class BlogController {
  async addBlog(req, res) {
    try {
      const { body } = req;
      const checkImage = req.file ? req.file.path : null;
      body.feature_img = checkImage;

      // handle multiple category id
      body.blog_category_id = Array.isArray(body.blog_category_id)
        ? body.blog_category_id.map(Number)
        : [Number(body.blog_category_id)];

      body.blog_tags = Array.isArray(body.blog_tags)
        ? body.blog_tags.filter((tag) => typeof tag === "string").map(String)
        : typeof body.blog_tags === "string"
        ? [body.blog_tags]
        : [];

      const result = BlogSchema.safeParse(body);

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid request data", error: result.error });
      }

      const {
        blog_category_id,
        title,
        excerpt,
        content,
        feature_img,
        blog_tags,
      } = result.data;

      const categories = await BlogCategory.find({
        _id: { $in: blog_category_id },
      });
      if (categories.length !== blog_category_id.length) {
        return res
          .status(400)
          .json({ message: "One or more categories do not exist" });
      }
      const existingTags = await BlogTags.find({ name: { $in: blog_tags } });
      const existingTagNames = existingTags.map((tag) => tag.name);

      // Find missing tag names that need to be created
      const missingTagNames = blog_tags.filter(
        (tagName) => !existingTagNames.includes(tagName)
      );

      // Create new tags for missing tag names
      const newTags = await Promise.all(
        missingTagNames.map(async (tagName) => {
          const newTag = new BlogTags({ name: tagName });
          return await newTag.save();
        })
      );

      // Collect all tag IDs (existing + new)
      const allTagIds = [
        ...existingTags.map((tag) => tag._id),
        ...newTags.map((tag) => tag._id),
      ];

      const newBlog = new Blogs({
        blog_category_id,
        title,
        excerpt,
        content,
        feature_img,
      });

      await newBlog.save();
      console.log(newBlog);

      return res
        .status(200)
        .json({ message: "Blog created successfully ", newBlog });
    } catch (error) {
      res.status(400).json({ message: `Blog Error : ${error.message}` });
    }
  }

  async getAllBlogs(req, res) {
    try {
      const blogs = await Blogs.find()
        .populate({
          path: "blog_category_id",
          model: "BlogCategory",
          select: "category_name",
        })
        .populate({
          path: "blog_tags",
          model: "BlogTags",
          select: "name",
        })
        .lean();

      const transformedBlogs = blogs.map((blog) => ({
        ...blog,
        category_names: Array.isArray(blog.blog_category_id)
          ? blog.blog_category_id.map((cat) => cat.category_name)
          : [],

        tag_names: Array.isArray(blog.blog_tags)
          ? blog.blog_tags.map((tag) => tag.name)
          : [],

        blog_category_id: undefined,
        blog_tags: undefined,
      }));

      res.status(200).json(transformedBlogs);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error while getting blogs", error: error.message });
    }
  }

  async getAllBlogsByCategoryId(req, res) {
    try {
      const blog_category_id = Number(req.params.blog_category_id);

      if (isNaN(blog_category_id)) {
        return res.status(400).json({ message: "Invalid blog category ID" });
      }

      const category_blogs = await Blogs.find({
        blog_category_id: { $in: [blog_category_id] },
      })
        .populate({
          path: "blog_category_id",
          model: "BlogCategory",
          select: "category_name",
        })
        .lean();

      if (category_blogs.length === 0) {
        return res
          .status(404)
          .json({ message: "No blogs found for this category" });
      }

      const transformedBlogs = category_blogs.map((blog) => ({
        ...blog,
        category_names: blog.blog_category_id.map((cat) => cat.category_name),
        blog_category_id: undefined, // Remove original category_id field
      }));

      res.status(200).json(transformedBlogs);
    } catch (error) {
      console.error("Error while getting blogs:", error.message);
      res
        .status(500)
        .json({ message: "Error while getting the blogs by category ID" });
    }
  }

  async getBlogById(req, res) {
    try {
      const blog_id = Number(req.params?.blog_id);

      if (!blog_id) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await Blogs.findById(blog_id);

      if (!blog) {
        return res.status(404).json({ message: "Blog Not Found" });
      }

      return res.status(200).json({ status: true, blog });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while fetching blog: ${error.message}` });
    }
  }

  async updateBlog(req, res) {
    try {
      const blog_id = Number(req.params?.blog_id);
      if (!blog_id) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const existingBlog = await Blogs.findById(blog_id);
      if (!existingBlog) {
        return res.status(404).json({ message: "Blog Not Found" });
      }

      if (req.file) {
        req.body.feature_img = req.file.path;
      }

      if (req.body.blog_category_id) {
        req.body.blog_category_id = Array.isArray(req.body.blog_category_id)
          ? req.body.blog_category_id.map(Number)
          : [Number(req.body.blog_category_id)];
      }

      if (req.body.blog_tags) {
        req.body.blog_tags = Array.isArray(req.body.blog_tags)
          ? req.body.blog_tags
              .filter((tag) => typeof tag === "string")
              .map(String)
          : typeof req.body.blog_tags === "string"
          ? [req.body.blog_tags]
          : [];
      }

      const updatedData = BlogSchema.partial().safeParse(req.body);
      if (!updatedData.success) {
        return res
          .status(400)
          .json({ message: "Invalid request data", error: updatedData.error });
      }

      if (updatedData.data.blog_category_id) {
        const categories = await BlogCategory.find({
          _id: { $in: updatedData.data.blog_category_id },
        });
        if (categories.length !== updatedData.data.blog_category_id.length) {
          return res
            .status(400)
            .json({ message: "One or more categories do not exist" });
        }
      }

      if (updatedData.data.blog_tags) {
        const existingTags = await BlogTags.find({
          name: { $in: updatedData.data.blog_tags },
        });
        const existingTagNames = existingTags.map((tag) => tag.name);

        const missingTagNames = updatedData.data.blog_tags.filter(
          (tagName) => !existingTagNames.includes(tagName)
        );

        const newTags = await Promise.all(
          missingTagNames.map(async (tagName) => {
            const newTag = new BlogTags({ name: tagName });
            return await newTag.save();
          })
        );

        updatedData.data.blog_tags = [
          ...existingTags.map((tag) => tag._id),
          ...newTags.map((tag) => tag._id),
        ];
      }

      const updatedBlog = await Blogs.findByIdAndUpdate(
        blog_id,
        updatedData.data,
        { new: true, runValidators: true }
      );

      return res
        .status(200)
        .json({ message: "Blog updated successfully", updatedBlog });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while updating blog: ${error.message}` });
    }
  }

  async deleteBlog(req, res) {
    try {
      const blog_id = Number(req.params?.blog_id);
      if (!blog_id) {
        return res.status(400).json({ message: "Blog ID is required" });
      }

      const blog = await Blogs.findById(blog_id);
      if (!blog) {
        return res.status(404).json({ message: "Blog Not Found" });
      }

      await Blogs.findByIdAndDelete(blog_id);

      return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while deleting blog: ${error.message}` });
    }
  }
}

export default new BlogController();
