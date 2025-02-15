const express = require("express");
const {
  Product,
  ProductAttributes,
  ProductAttributesValues,
  ProductVariants,
  ProductVariantAttribute,
} = require("../models/Product");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, type, price, content, attributes, variants } = req.body;

    // Check if 'price' is required for simple products
    if (type.toLowerCase() === "simple" && !price) {
      return res
        .status(400)
        .json({ message: "Price is required for simple product" });
    }

    // Create a new product
    const product = new Product({
      name,
      type,
      price,
      content,
      attributes: [], // Initialize an empty array for attributes
      variants: [], // Initialize an empty array for variants
    });

    // Save the product
    await product.save();

    let attributeMap = {};

    // Handle attributes (create them if they don't exist)
    for (let attr of attributes) {
      let attribute = await ProductAttributes.findOne({ name: attr.name });
      if (!attribute) {
        attribute = new ProductAttributes({ name: attr.name });
        await attribute.save();
      }

      // Store the _id of the created attribute
      attributeMap[attr.name] = attribute._id;

      // Save the attribute reference to the product
      product.attributes.push(attribute._id);

      // Handle attribute values
      for (let value of attr.values) {
        let attrValue = await ProductAttributesValues.findOne({ value });
        if (!attrValue) {
          attrValue = new ProductAttributesValues({
            value: value,
            attribute: attribute._id,
          });
          await attrValue.save();
        }
      }
    }

    // Save the updated product with attributes
    await product.save();

    let variantList = [];
    // Handle variants (create them if the product type is 'variant')
    if (type === "variant" && variants && variants.length > 0) {
      for (let variant of variants) {
        // Find the attribute values corresponding to the variant's attributes
        let attrValues = await ProductAttributesValues.find({
          value: { $in: variant.attributes },
        });

        // Create a new variant
        const newVariant = new ProductVariants({
          product: product._id,
          price: variant.price,
          attributes: attrValues.map((value) => value._id), // Use the ObjectIds of attribute values
        });

        await newVariant.save();
        variantList.push(newVariant._id); // Store the new variant's ObjectId
      }
    }

    // Assign the created variants to the product
    product.variants = variantList;

    // Save the product with the assigned variants
    await product.save();

    // Return success response
    return res
      .status(201)
      .json({ product, message: "Product created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("attributes")
      .populate({
        path: "variants",
        populate: {
          path: "attributes",
          model: "ProductAttributesValues",
        },
      });
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, type, price, content, attributes, variants } = req.body;

    // Find the existing product by ID
    const updatedProduct = await Product.findById(req.params.id);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle attributes and update or create them if necessary
    let attributeMap = {};
    updatedProduct.attributes = []; // Reset attributes to ensure they are properly updated

    // Update or create ProductAttributes
    for (let attr of attributes) {
      let attribute = await ProductAttributes.findOne({ name: attr.name });
      if (!attribute) {
        attribute = new ProductAttributes({ name: attr.name });
        await attribute.save();
      }

      attributeMap[attr.name] = attribute._id;

      // Update product's attributes with the correct ObjectId reference
      updatedProduct.attributes.push(attribute._id);

      // Handle attribute values, creating them if they do not exist
      for (let value of attr.values) {
        let attrValue = await ProductAttributesValues.findOne({ value });
        if (!attrValue) {
          attrValue = new ProductAttributesValues({
            value: value,
            attribute: attribute._id,
          });
          await attrValue.save();
        }
      }
    }

    // Handle variants (if any)
    let variantList = [];
    if (type === "variant" && variants && variants.length > 0) {
      // Clear existing variants and reassign them based on updated data
      updatedProduct.variants = [];
      
      for (let variant of variants) {
        // Find the attribute values corresponding to the variant's attributes
        let attrValues = await ProductAttributesValues.find({
          value: { $in: variant.attributes },
        });

        // Create a new variant and associate the correct attribute values
        const newVariant = new ProductVariants({
          product: updatedProduct._id,
          price: variant.price,
          attributes: attrValues.map((value) => value._id), // Use ObjectId references
        });

        await newVariant.save();
        variantList.push(newVariant._id); // Store the new variant's ObjectId
      }
      
      updatedProduct.variants = variantList; // Assign the new variants to the product
    }

    // Save the updated product document
    await updatedProduct.save();

    // Return the response with the updated product
    res.json({ message: "Product updated successfully", updatedProduct });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// here I created routes for product realted api's like updating variants , fetching all details of product using id , and creating a product
// I used populate method to fetch the data from other collections
