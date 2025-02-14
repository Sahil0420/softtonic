import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      variants: req.body.variants,
    });

    const savedProducts = await product.save();
    res.status(201).json({ message: "product successfully saved" });
  } catch (error) {
    res.status.apply(400).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
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
    const { name, variants } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
        {name , variants},
        {new : true}
    );

    if (!updatedProduct){
        return res.status(404).json({message : "Product not found"});
    }

    res.json(updatedProduct);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;


// here I created routes for product realted api's like updating variants , fetching all details of product using id , and creating a product