import {
  ProductAttributes,
  ProductAttributesValues,
} from "../models/productSchema/Attributes.js";
import Products from "../models/productSchema/Products.js";
import Counter from "../models/dbSchema/Counter.js";

const addAttribute = async (req, res) => {
  try {
    const { name, values } = req.body;

    const attribute = new ProductAttributes({ name });
    await attribute.save();

    for (let value of values) {
      const attrValue = new ProductAttributesValues({
        value,
        attribute: attribute._id,
      });
      await attrValue.save();
    }

    res
      .status(201)
      .json({ message: "Attribute added successfully", attribute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAttributes = async (req, res) => {
  try {
    const attributes = await ProductAttributes.aggregate([
      {
        $lookup: {
          from: "productattributesvalues",
          localField: "_id",
          foreignField: "attribute",
          as: "values",
        },
      },
    ]);

    res.status(200).json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateAttribute = async (req, res) => {
  try {
    const { name, values } = req.body;
    const attributeId = Number(req.params.id); // Ensure it's treated as a Number

    // Update attribute name
    const updatedAttribute = await ProductAttributes.findByIdAndUpdate(
      attributeId,
      { name },
      { new: true }
    );

    if (!updatedAttribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    if (values && Array.isArray(values)) {
      // Delete old values linked to this attribute
      await ProductAttributesValues.deleteMany({ attribute: attributeId });

      // Generate new IDs for attribute values
      const newValues = [];
      for (const value of values) {
        let counter = await Counter.findByIdAndUpdate(
          { _id: "attributevalueid" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true, runValidators: true }
        );

        newValues.push({
          _id: counter.seq, // Ensure numeric `_id`
          value,
          attribute: attributeId, // Ensure consistent reference
        });
      }

      // Insert new values
      await ProductAttributesValues.insertMany(newValues);
    }

    res.json({ message: "Attribute updated successfully", updatedAttribute });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;

    const attribute = await ProductAttributes.findById(id);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    // Delete all associated attribute values first
    await ProductAttributesValues.deleteMany({ attribute: id });

    // deletee the attribute
    await ProductAttributes.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Attribute and related values deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting attribute: ${error.message}` });
  }
};

const getAttributeByProductId = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const attributes = await ProductAttributes.aggregate([
      { $match: { _id: { $in: product.attributes } } },
      {
        $lookup: {
          from: "productattributesvalues",
          localField: "_id",
          foreignField: "attribute",
          as: "values",
        },
      },
    ]);

    res.status(200).json({ attributes });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching attributes: ${error.message}` });
  }
};

export {
  addAttribute,
  getAllAttributes,
  updateAttribute,
  deleteAttribute,
  getAttributeByProductId,
};
