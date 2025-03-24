import Order from "../models/dbSchema/Orders.js";

class OrderController {
  // Create a new order for the authenticated user.
  async createOrder(req, res) {
    try {
      const { items } = req.body;
      if (!items || items.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "Order items required" });
      }

      const newOrder = new Order({
        user_id: req.user._id,
        items,
      });

      await newOrder.save();
      res.status(201).json({
        status: true,
        message: "Order Placed Successfully",
        order: newOrder,
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  // Retrieve all orders for the authenticated user.
  async getOrders(req, res) {
    try {
      const orders = await Order.find({ user_id: req.user._id }).populate(
        "items.product_id"
      );
      res.status(200).json({ status: true, orders });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  // Retrieve a specific order by its ID for the authenticated user.
  async getOrderById(req, res) {
    try {
      const order = await Order.findOne({
        _id: req.params.orderid,
        user_id: req.user._id,
      }).populate("items.product_id");

      if (!order) {
        return res
          .status(404)
          .json({ status: false, message: "Order not found" });
      }

      res.status(200).json({ status: true, order });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  // Update the status of an order.
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const { orderId } = req.params;

      // Validate the status update
      if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid status update" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ status: false, message: "Order not found" });
      }

      order.status = status;
      await order.save();

      res
        .status(200)
        .json({ status: true, message: "Order status updated", order });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  // Cancel an order if it is in the 'pending' status.
  async cancelOrder(req, res) {
    try {

      // orderid will be alphanumeric currently using mongo db id

      const order = await Order.findOne({
        _id: req.params.orderid,
        user_id: req.user._id,
      });

      if (!order) {
        return res
          .status(404)
          .json({ status: false, message: "Order not found" });
      }

      // Ensure the order is in 'pending' status
      if (order.status !== "pending") {
        return res.status(400).json({
          status: false,
          message: "Only pending orders can be cancelled",
        });
      }

      order.status = "cancelled";
      await order.save();

      res.status(200).json({
        status: true,
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
}

export default new OrderController();
