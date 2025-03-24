import { z } from "zod";
import Category from "../models/productSchema/Category.js";

const addCategorySchema = z.object({
  category_name: z.string().min(3, "Category name is required"),
  category_img: z.string().optional(),
});

const updateCategorySchema = z.object({
  category_name: z.string().min(3, "Category name is required for updation"),
  category_img: z.string().optional(),
});

const addCategory = async (req, res) => {
  try {
    const validatedData = addCategorySchema.parse(req.body);

    const categoryExist = await Category.findOne({
      category_name: validatedData.category_name.toLowerCase(),
    });

    if (categoryExist) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : validatedData.category_img;

    const newCategory = new Category({
      category_name: validatedData.category_name.toLowerCase(),
      category_img: imageUrl,
    });

    await newCategory.save();

    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid request body", error: error.issues });
    }
    console.error(error);
    res.status(500).json({
      message: `Server error during adding category --> ${error.message}`,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error during fetching category --> ${error.message}`,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ category_name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error during fetching categories --> ${error.message}`,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const validatedData = updateCategorySchema.parse(req.body);
    validatedData.category_name = validatedData.category_name.toLowerCase();

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : validatedData.category_img;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...validatedData,
        category_img: imageUrl,
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid request body", error: error.issues });
    }
    console.error(error);
    res.status(500).json({
      message: `Server error during updating category --> ${error.message}`,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deletbded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error during deleting category --> ${error.message}`,
    });
  }
};

export {
  deleteCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  addCategory,
};
