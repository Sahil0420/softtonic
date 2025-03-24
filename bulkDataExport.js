import mongoose from "mongoose";
import fs from "fs";
import { json2csv } from "json-2-csv";
import dotenv from "dotenv";
import winston from "winston"; // Import winston for logging
import connectDB from "./config/db.js";
import Products from "./models/productSchema/Products.js";
import Category from "./models/productSchema/Category.js";
import Subcategory from "./models/productSchema/Subcategory.js";
import {
  ProductAttributes,
  ProductAttributesValues,
} from "./models/productSchema/Attributes.js";
import ProductVariants from "./models/productSchema/Variants.js";
import ProductGallery from "./models/productSchema/ProductGallery.js";

dotenv.config();
connectDB();

// Configure winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: "bulkDataExport.log" }), // Log to file
  ],
});

const exportData = async (outputFilePath) => {
  try {
    logger.info("Starting data export...");

    const products = await Products.find()
      .populate("category_id", "category_name")
      .populate("subcategory_id", "subcategory_name")
      .populate("variants")
      .lean();

    const csvData = [];

    for (const product of products) {
      const categoryName = product.category_id?.category_name || "";
      const subcategoryName = product.subcategory_id?.subcategory_name || "";

      // Get Attributes & Values (Only for variant-type products)
      let attributeNames = "";
      let attributeValuesList = "";

      if (product.type === "variant") {
        const attributes = await ProductAttributes.find({ _id: { $in: product.attributes } });
        const attributeValues = await ProductAttributesValues.find({
          _id: { $in: product.attribute_values },
        });

        attributeNames = attributes.map((attr) => attr.name).join("|");
        attributeValuesList = attributeValues.map((val) => val.value).join("|");
      }

      // Get Product Images
      const productImages = product.product_gallery ? product.product_gallery.join("|") : "";

      // Base Product Row
      csvData.push({
        category_name: categoryName,
        subcategory_name: subcategoryName,
        product_name: product.product_name,
        sku: product.sku,
        long_description: product.long_description || "",
        short_description: product.short_description || "",
        type: product.type,
        feature_img: product.feature_img || "",
        price: product.price || "",
        sale_price: product.sale_price || "",
        stock: product.stock || 0,
        attributes: attributeNames, // Only for variant products
        attribute_values: attributeValuesList, // Only for variant products
        product_gallery: productImages,
        variant_sku: "", // Empty for base product
        variant_price: "",
        variant_sale_price: "",
        variant_stock: "",
        variant_gallery: "",
      });

      logger.info(`Processed base product: ${product.product_name}`);

      // Process Variants
      for (const variant of product.variants) {
        const variantAttributes = await ProductAttributesValues.find({
          _id: { $in: variant.attributes },
        });

        const variantAttributeValues = variantAttributes.map((attr) => attr.value).join("|");

        // Get Variant Images
        const variantGalleryEntry = await ProductGallery.findOne({ variant: variant._id });
        const variantImages = variantGalleryEntry ? variantGalleryEntry.images.join("|") : "";

        csvData.push({
          category_name: categoryName,
          subcategory_name: subcategoryName,
          product_name: product.product_name,
          sku: product.sku,
          long_description: product.long_description || "",
          short_description: product.short_description || "",
          type: "variant",
          feature_img: variantImages.split("|")[0] || "",
          price: "",
          sale_price: "",
          stock: "",
          attributes: attributeNames, // Inherited from parent
          attribute_values: variantAttributeValues,
          product_gallery: "",
          variant_sku: variant.sku,
          variant_price: variant.price || "",
          variant_sale_price: variant.sale_price || "",
          variant_stock: variant.stock || 0,
          variant_gallery: variantImages,
        });

        logger.info(`Processed variant: ${variant.sku}`);
      }
    }

    // Convert JSON to CSV using json-2-csv
    const csv = await json2csv(csvData);

    // Write CSV to File
    fs.writeFileSync(outputFilePath, csv);
    logger.info(`CSV Export Completed: ${outputFilePath}`);

    mongoose.disconnect();
  } catch (error) {
    logger.error(`Error exporting data: ${error.message}`);
    mongoose.disconnect();
  }
};

// Run Exporter
exportData("./exportedData.csv");
