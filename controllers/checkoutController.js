import Cart from "../models/dbSchema/Cart.js";
import Order from "../models/dbSchema/Orders.js";
import Address from "../models/dbSchema/Address.js";
import Products from "../models/productSchema/Products.js";

class CheckoutController {
  // Get Checkout Details
  async getCheckoutDetails(req, res) {
    try {
      const user_id = req.user._id;
      const cart = await Cart.findOne({ user_id }).populate("items.product_id");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }

      const address = await Address.findOne({ user_id });
      if (!address) {
        return res.status(400).json({ message: "No saved addresses found" });
      }

      let totalAmount = 0;
      let totalDiscount = 0;
      const cartItems = cart.items.map((item) => {
        const product = item.product_id;
        const originalPrice = product.price * item.quantity;
        const discountedPrice = product.sale_price * item.quantity;
        const discountAmount = originalPrice - discountedPrice;
        const discountPercentage = Math.round(
          (discountAmount / originalPrice) * 100
        );

        totalAmount += discountedPrice;
        totalDiscount += discountAmount;

        return {
          product_id: product._id,
          name: product.product_name,
          quantity: item.quantity,
          original_price: product.price,
          sale_price: product.sale_price,
          total_original_price: originalPrice,
          total_sale_price: discountedPrice,
          discount: discountAmount,
          discountPercentage: discountPercentage,
          image_url: product.feature_img,
        };
      });

      res.json({ cartItems, totalAmount, totalDiscount, address });
    } catch (error) {
      console.error("Error fetching checkout details:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Process Checkout
  async processCheckout(req, res) {
    try {
      const user_id = req.user._id;
      const { address_id, payment_method } = req.body;

      const cart = await Cart.findOne({ user_id }).populate("items.product_id");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const address = await Address.findOne({ _id: address_id, user_id });
      if (!address) {
        return res.status(400).json({ message: "Invalid address selected" });
      }

      let totalAmount = 0;
      let totalDiscount = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product_id;

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.product_name}, Available: ${product.stock}`,
          });
        }

        const originalPrice = product.price * item.quantity;
        const discountedPrice = product.sale_price * item.quantity;
        const discountAmount = originalPrice - discountedPrice;

        totalAmount += discountedPrice;
        totalDiscount += discountAmount;

        orderItems.push({
          product_id: product._id,
          name: product.product_name,
          quantity: item.quantity,
          price: product.sale_price,
          original_price: product.price,
          total_price: discountedPrice,
          discount: discountAmount,
        });
      }

      // Create the order
      const newOrder = new Order({
        user_id,
        items: orderItems,
        address_id,
        payment_method,
        total_amount: totalAmount,
        total_discount: totalDiscount,
        status: "pending",
      });

      await newOrder.save();

      // Update stock
      for (const item of cart.items) {
        await Products.updateOne(
          { _id: item.product_id._id },
          { $inc: { stock: -item.quantity } }
        );
      }

      // Clear cart after checkout
      cart.items = [];
      await cart.save();

      res.json({
        message: "Order placed successfully",
        order_id: newOrder._id,
        totalAmount,
        totalDiscount,
      });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new CheckoutController();
