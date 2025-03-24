import Cart from "../models/dbSchema/Cart.js";
import Products from "../models/productSchema/Products.js";
import { z } from "zod";

const addToCartSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const updateCartItemSchema = z.object({
  product_id: z.string(), // this id will be changed to alphanumeric currently using objectId of mongoose
  quantity: z.number().int().positive(),
});

const check_availability = (stock, quantity) => {
  return stock >= quantity;
};

class CartController {
  async addToCart(req, res) {
    try {
      const { body } = req;
      const result = addToCartSchema.safeParse(body);
      if (!result.success)
        return res
          .status(400)
          .json({ message: "Invalid request data", error: result.error });

      const { product_id, quantity } = result.data;
      const user_id = req.user._id;

      const product = await Products.findOne({ _id: product_id });
      if (!product) return res.status(400).json({ message: "Product not found" });

      // check stock 

      if (!check_availability(product.stock, quantity))
        return res.status(400).json({
          message: `Only ${product.stock} Items of this product is available`,
        });

      const cart = await Cart.findOne({ user_id });

      if (cart) {
        const existingItem = cart.items.find(
          (item) => item.product_id === product_id
        );
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          if (!check_availability(product.stock, newQuantity)) {
            return res.status(400).json({
              message: `Only ${product.stock} items of this product are available`,
            });
          }

          existingItem.quantity = newQuantity;
        } else {
          cart.items.push({
            product_id,
            name: product.name,
            quantity,
            image_url: product.image_url,
            added_at: new Date(),
          });
        }

        await cart.save();
      } else {
        const newCart = new Cart({
          user_id,
          items: [
            {
              product_id,
              name: product.name,
              quantity,
              image_url: product.image_url,
              added_at: new Date(),
            },
          ],
        });
        await newCart.save();
      }
      res.json({ message: "Product added to cart successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: `Internal Server Error --> ${error.message}` });
    }
  }

  async getCartItems(req, res) {
    try {
      const user_id = req.user._id;
      const cart = await Cart.findOne({ user_id }).populate("items.product_id");
      if (!cart) return res.json({ message: "Cart's empty" });
      res.json(cart.items);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: `"Internal Server Error" ---> ${error}` });
    }
  }

  async updateCartItems(req, res) {
    try {
      const { params, body } = req;

      const product_id = params.cart_product_id; // this will be alphanumeric id currently objectId of mongo

      const result = updateCartItemSchema.safeParse({
        product_id,
        quantity: body.quantity,
      });

      if (!result.success) {
        console.error("Validation Error:", result.error);
        return res
          .status(400)
          .json({ message: "Invalid request data", error: result.error });
      }

      const { quantity } = result.data;
      const user_id = req.user._id;

      const cart = await Cart.findOne({ user_id });
      if (!cart) {
        console.error("Cart not found for user_id:", user_id);
        return res.status(404).json({ message: "Cart is empty" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === product_id.toString()
      );

      if (itemIndex === -1) {
        console.error("Item not found in cart for id:", product_id);
        return res.status(404).json({ message: "Item not found in cart" });
      }

      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      res.json({ message: "Cart item updated successfully" });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async removeFromCart(req, res) {
    try {
      let { id } = req.params;
      // id = parseInt(id)
      const user_id = req.user._id;
      const cart = await Cart.findOne({ user_id });
      if (!cart) return res.json({ message: "Cart is empty" });

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === id.toString()
      );

      if (itemIndex === -1)
        return res.json({ message: "Item not found in cart" });

      cart.items.splice(itemIndex, 1);
      await cart.save();

      res.json({ message: "Item removed from cart successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new CartController();
