import ProductVariants from "../models/productSchema/ProductVariants.js";
import ProductGallery from "../models/productSchema/ProductGallery.js";

const addVariant = async (req, res) => {
  try {
    const { product_id, sku, price, sale_price, stock, attributes } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const productExists = await Products.findById(product_id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (!sku) {
      return res
        .status(400)
        .json({ message: "SKU is required for the variant." });
    }

    // Handle attributes
    let attributeValueIds = [];
    if (attributes?.length > 0) {
      for (const attr of attributes) {
        // Find or create attribute
        let attribute = await ProductAttributes.findOne({ name: attr.name });
        if (!attribute) {
          attribute = new ProductAttributes({ name: attr.name });
          await attribute.save();
        }

        // Find or create attribute values
        for (const value of attr.values) {
          let attrValue = await ProductAttributesValues.findOne({
            value,
            attribute: attribute._id,
          });

          if (!attrValue) {
            attrValue = new ProductAttributesValues({
              value,
              attribute: attribute._id,
            });
            await attrValue.save();
          }

          attributeValueIds.push(attrValue._id);
        }
      }
    }

    const newVariant = new ProductVariants({
      product: product_id,
      sku,
      price: Number(price),
      sale_price: Number(sale_price) || 0,
      stock: Number(stock) || 0,
      attributes: attributeValueIds, 
    });

    await newVariant.save();

    return res
      .status(201)
      .json({ variant: newVariant, message: "Variant added successfully." });
  } catch (error) {
    return res.status(400).json({ message: `Error -->> : ${error.message}` });
  }
};


const getVariants = async (req, res) => {
  try {
    const variants = await ProductVariants.find().populate("attributes");
    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.id);
    const { price, stock, attributes } = req.body;

    const updatedVariant = await ProductVariants.findByIdAndUpdate(
      variantId,
      { price, stock, attributes },
      { new: true }
    );

    if (!updatedVariant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.json({ message: "Variant updated successfully", updatedVariant });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.id);
    const variant = await ProductVariants.findById(variantId);

    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Delete associated gallery
    await ProductGallery.deleteMany({ variant: variantId });

    // Delete variant
    await ProductVariants.findByIdAndDelete(variantId);

    res
      .status(200)
      .json({ message: "Variant and associated images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addVariant, getVariants, updateVariant, deleteVariant };
