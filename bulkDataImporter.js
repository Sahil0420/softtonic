import mongoose from "mongoose";
import fs from "fs";
import csvParser from "csv-parser";
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
import ProductGallery from "./models/productSchema/ProductGallery.js"; // Import ProductGallery model

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
    new winston.transports.File({ filename: "bulkDataImporter.log" }), // Log to file
  ],
});

const importData = async (filePath) => {
  try {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const cleanedRow = {};
        for (const key in row) {
          cleanedRow[key.trim()] = row[key] ? row[key].trim() : "";
        }
        results.push(cleanedRow);
      })
      .on("end", async () => {
        for (const row of results) {
          logger.info(`Processing row: ${JSON.stringify(row)}`);

          if (!row.category_name || !row.subcategory_name || !row.product_name) {
            logger.warn(`Skipping row due to missing required fields: ${JSON.stringify(row)}`);
            continue;
          }

          try {
            // Create Category
            const categoryName = row.category_name.toLowerCase();
            let category = await Category.findOne({ category_name: categoryName });
            if (!category) {
              category = await new Category({ category_name: categoryName }).save();
              logger.info(`Category created: ${categoryName}`);
            }

            // Create Subcategory
            const subcategoryName = row.subcategory_name.toLowerCase();
            let subcategory = await Subcategory.findOne({ subcategory_name: subcategoryName });
            if (!subcategory) {
              subcategory = await new Subcategory({
                subcategory_name: subcategoryName,
                category_id: category._id,
              }).save();
              logger.info(`Subcategory created: ${subcategoryName}`);
            }

            // Create Product
            let product = await Products.findOne({ product_name: row.product_name.toLowerCase() });
            if (!product) {
              product = new Products({
                product_name: row.product_name.toLowerCase(),
                sku: row.sku,
                type: row.type,
                long_description: row.long_description,
                short_description: row.short_description,
                category_id: category._id,
                subcategory_id: subcategory._id,
                price: row.price ? parseFloat(row.price) : undefined,
                sale_price: row.sale_price ? parseFloat(row.sale_price) : undefined,
                stock: row.stock ? parseInt(row.stock) : 0,
                feature_img: row.feature_img || "",
                attributes: [],
                variants: [],
              });

              await product.save();
              logger.info(`Product created: ${row.product_name}`);
            }

            // Process Attributes (Only for Variants)
            let attributesArray = [];
            let attributesValuesArray = [];
            if (row.type === "variant" && row.variant_attributes) {
              logger.info(`Processing attributes for: ${row.product_name}`);

              const attributeNames = row.variant_attributes.split("|");
              const attributeValues = row.variant_attribute_values
                ? row.variant_attribute_values.split("|")
                : [];

              for (let i = 0; i < attributeNames.length; i++) {
                let attrName = attributeNames[i].trim();
                let attrValue = attributeValues[i] ? attributeValues[i].trim() : "";

                if (!attrName || !attrValue) continue;

                let attribute = await ProductAttributes.findOne({ name: attrName.toLowerCase() });
                if (!attribute) {
                  attribute = await new ProductAttributes({ name: attrName.toLowerCase() }).save();
                  logger.info(`Attribute created: ${attrName}`);
                }

                let attributeValue = await ProductAttributesValues.findOne({
                  value: attrValue.toLowerCase(),
                  attribute: attribute._id,
                });

                if (!attributeValue) {
                  attributeValue = await new ProductAttributesValues({
                    value: attrValue.toLowerCase(),
                    attribute: attribute._id,
                  }).save();
                  logger.info(`Attribute value created: ${attrValue}`);
                }

                attributesArray.push(attribute._id);
                attributesValuesArray.push(attributeValue._id);
              }
            }

            // Process Variants (Only for "variant" products)
            if (row.type === "variant" && row.variant_sku) {
              logger.info(`Processing variants for: ${row.product_name}`);

              const newVariant = new ProductVariants({
                product: product._id,
                sku: row.variant_sku.trim(),
                price: parseFloat(row.variant_price),
                sale_price: row.variant_sale_price ? parseFloat(row.variant_sale_price) : undefined,
                stock: parseInt(row.variant_stock),
                attributes: attributesValuesArray, // Link variant to attribute values
              });

              await newVariant.save();
              logger.info(`Variant created: ${row.variant_sku.trim()}`);

              // Save Variant Images in Gallery
              let variantGalleryImages = row.variant_gallery ? row.variant_gallery.split("|") : [];
              if (variantGalleryImages.length > 0) {
                const variantGalleryEntry = new ProductGallery({
                  variant: newVariant._id,
                  images: variantGalleryImages,
                });
                await variantGalleryEntry.save();
                logger.info(`Variant gallery saved for: ${row.variant_sku.trim()}`);
              }

              // Add Variant to Product's Variants Array
              await Products.updateOne(
                { _id: product._id },
                { $push: { variants: newVariant._id, attributes: { $each: attributesArray } } }
              );
            }
          } catch (err) {
            logger.error(`Error processing row: ${JSON.stringify(row)} - ${err.message}`);
          }
        }

        logger.info("CSV Import Completed Successfully!");
        mongoose.disconnect();
      });
  } catch (error) {
    logger.error(`Error in bulk import: ${error.message}`);
    mongoose.disconnect();
  }
};

// Start Import
importData("./bulkData.csv");
