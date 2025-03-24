import Products from "../models/productSchema/Products.js";
import Subcategory from "../models/productSchema/Subcategory.js";
import Category from "../models/productSchema/Category.js";
import {
  ProductAttributes,
  ProductAttributesValues,
} from "../models/productSchema/Attributes.js";
import ProductVariants from "../models/productSchema/Variants.js";
import ProductGallery from "../models/productSchema/ProductGallery.js";
import { z } from "zod";

// Define Zod schema for product validation
const addProductSchema = z.object({
  product_name: z.string().min(3, "Product name is required"),
  sku: z.string().min(8, "SKU number is required").optional(),
  type: z.enum(["simple", "variant"]),
  price: z.number().positive().optional(),
  sale_price: z.number().positive().optional(),
  percentage: z.number().min(0).max(100).optional(),
  long_description: z.string().optional(),
  short_description: z.string().optional(),
  feature_img: z.string().optional(),
  product_gallery: z.number().int().positive().optional(),
  category_id: z.number().int().positive(),
  subcategory_id: z.number().int().positive(),
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name is required"),
        values: z.array(z.string().min(1, "Attribute value is required")),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive(),
        sale_price: z.number().positive().optional(),
        percentage: z.number().min(0).max(100).optional(),
        attributes: z.array(z.string().min(1, "Attribute value is required")),
        feature_img: z.string().optional(),
        variant_gallery: z.number().int().positive().optional(),
      })
    )
    .optional(),
  stock: z.number().int().positive().optional(),
});

// Controller to add a product
const addProduct = async (req, res) => {
  try {
    if (req.body.type === "simple") {
      req.body.price = Number(req.body.price);
      req.body.sale_price = Number(req.body.sale_price);
      req.body.stock = Number(req.body.stock);
    }

    req.body.category_id = Number(req.body.category_id);
    req.body.subcategory_id = Number(req.body.subcategory_id);

    // Validate input
    const validatedData = addProductSchema.parse(req.body);

    const { category_id, subcategory_id, type } = validatedData;

    // Check category & subcategory
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category does not exist" });
    }

    const subcategoryExists = await Subcategory.findOne({
      _id: subcategory_id,
      category_id,
    });
    if (!subcategoryExists) {
      return res.status(400).json({ message: "Invalid subcategory." });
    }

    // Handle image uploads
    const featureImg = req.files?.feature_img?.[0]?.filename || null;
    const uploadedImages = req.files?.product_gallery?.map((file) => file.filename) || [];

    // Create product
    const product = new Products({
      ...validatedData,
      feature_img: featureImg,
      percentage: validatedData.sale_price
        ? Math.round(
            ((validatedData.price - validatedData.sale_price) /
              validatedData.price) *
              100
          )
        : 0, // Auto-calculate percentage
    });

    await product.save();

    // Save product gallery (for simple products only)
    if (uploadedImages.length > 0 && type === "simple") {
      const gallery = new ProductGallery({
        images: uploadedImages,
        product: product._id,
      });

      await gallery.save();
      product.product_gallery = gallery._id;
      await product.save();
    }

    return res
      .status(201)
      .json({ product, message: "Product Created Successfully. Add variants separately." });
  } catch (error) {
    return res.status(400).json({ message: `Error -->> : ${error.message}` });
  }
};


// Controller to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find().lean();

    for (let product of products) {
      product.attributes = await ProductAttributes.find({
        _id: { $in: product.attributes },
      }).lean();

      if (product.type === "variant") {
        product.variants = await ProductVariants.find({ product: product._id })
          .populate({
            path: "attributes",
            model: ProductAttributesValues, // Ensure correct reference
          })
          .lean();
      }
    }
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server error during fetching products ---> ${error.message}`,
    });
  }
};

// Controller to get a product by ID
const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const product = await Products.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.attributes = await ProductAttributes.find({
      _id: { $in: product.attributes },
    }).lean();

    if (product.type === "variant") {
      product.variants = await ProductVariants.find({ product: productId })
        .populate({
          path: "attributes",
          model: ProductAttributesValues,
        })
        .lean();
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a product
const updateProduct = async (req, res) => {
  try {
    const validatedData = addProductSchema.partial().parse(req.body);

    if (req.files?.["feature_img"]) {
      validatedData.feature_img = req.files["feature_img"][0].path;
    }

    if (req.files?.["product_gallery"]) {
      validatedData.product_gallery = req.files["product_gallery"].map(
        (file) => file.path
      );
    }

    if (validatedData.sale_price && validatedData.price) {
      validatedData.percentage = Math.round(
        ((validatedData.price - validatedData.sale_price) /
          validatedData.price) *
          100
      );
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res
      .status(400)
      .json({ message: `Error updating product: ${error.message}` });
  }
};

// Controller to delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated variants
    await ProductVariants.deleteMany({ product: product._id });

    // Delete the product
    await Products.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product and associated variants deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting product: ${error.message}` });
  }
};

// Export all controllers
export {
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
