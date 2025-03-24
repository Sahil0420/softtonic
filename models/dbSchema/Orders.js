import mongoose from "mongoose";
import Counter from "./Counter.js";

const OrderSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    user_id: { type: Number, ref: "Users", required: true },

    items: [
      {
        product_id: { type: Number, ref: "Products", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],

    address_id: { type: Number, ref: "Address", required: true },

    payment_method: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    //ispaid
    

    order_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "orderid" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      console.error("Race condition detected");
      return next(new Error("Race condition occurred in orders"));
    }
    
    this._id = counter.seq;
  } catch (error) {
    console.log("Error in generating order ID");
    return next(error);
  }
  next();
});

const Order = mongoose.model("Orders", OrderSchema);

export default Order;
