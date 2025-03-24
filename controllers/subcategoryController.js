import Subcategory from "../models/productSchema/Subcategory.js";
import Category from "../models/productSchema/Category.js";
import { z } from "zod";

const addSubcategorySchema = z.object({
  subcategory_name: z.string().min(1, "Subcategory name is required"),
  category_id: z.number(),
  subcategory_img: z.string().optional(),
});

const updateSubcategorySchema = z.object({
  subcategory_name: z.string().min(3, "Subcategory name is required for updation"),
  subcategory_img: z.string().optional(),
});

const addSubcategory = async (req, res) => {
  try {
    const validatedData = addSubcategorySchema.parse(req.body);

    const categoryExist = await Category.findById(validatedData.category_id);

    if (!categoryExist) {
      res.status(400).json({ message: "Category not found" });
      return;
    }

    const subcategoryExist = await Subcategory.findOne({
      subcategory_name: validatedData.subcategory_name.toLowerCase(),
      category_id: validatedData.category_id,
    });

    if (subcategoryExist) {
      res.status(400).json({ message: "Subcategory already exists" });
      return;
    }

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : validatedData.subcategory_img;

    const subcategory = new Subcategory({
      subcategory_name: validatedData.subcategory_name.toLowerCase(),
      category_id: validatedData.category_id,
      subcategory_img: imageUrl,
    });

    await subcategory.save();

    res.status(201).json({ message: "Subcategory added successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Invalid request body", error: error.issues });
    } else {
      console.log(error);
      res.status(500).json({
        message: `Server error during adding subcategory ---> ${error.message}`,
      });
    }
  }
};

const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category_id")
      .sort({ subcategory_name: 1 });

    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({
      message: `Server error during fetching subcategories --> ${error.message}`,
    });
  }
};

const getSubcategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const subcategory = await Subcategory.findById(id).populate("category_id");

    if (!subcategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    res.status(200).json(subcategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server error during fetching subcategory ---> ${error.message}`,
    });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const id = req.params.id;
    const validatedData = updateSubcategorySchema.parse(req.body);

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : validatedData.subcategory_img;

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        subcategory_img: imageUrl,
      },
      { new: true }
    ).populate("category_id");

    if (!subcategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    res.status(200).json({ message: "Subcategory updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Invalid request body", error: error.issues });
    } else {
      console.error(error);
      res.status(500).json({
        message: `Server error during updating subcategory --> ${error.message}`,
      });
    }
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const id = req.params.id;
    const subcategory = await Subcategory.findByIdAndDelete(id);

    if (!subcategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error during deleting subcategory --> ${error.message}`,
    });
  }
};

export {
  addSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
};
