import express from "express";
import userAuthenticate from "../middleware/userMiddleware.js";
import CartController from "../controllers/cartController.js";
import CheckoutController from "../controllers/checkoutController.js";
import OrderController from "../controllers/orderController.js";

const CartRouter = express.Router();

CartRouter.post("/api/cart/", userAuthenticate, CartController.addToCart);
CartRouter.get("/api/cart/", userAuthenticate, CartController.getCartItems);


CartRouter.patch(
  "/api/cart/:cart_product_id",   
  userAuthenticate,
  CartController.updateCartItems
);  

// cart_product_id will be alphanumric 
//currently using mongo id

CartRouter.delete(
  "/api/cart/:cart_product_id",
  userAuthenticate,
  CartController.removeFromCart
);


// checkout routes

CartRouter.get(
  "/api/checkout/",
  userAuthenticate,
  CheckoutController.getCheckoutDetails
);

CartRouter.post(
  "/api/checkout-process/",
  userAuthenticate,
  CheckoutController.processCheckout
);


// Order Routes

CartRouter.get(
  "/api/orders/",
  userAuthenticate,
  OrderController.getOrders
)


// this will be the alphanumeric id
// currently using mongo db id

CartRouter.get(
  "/api/order/:orderid",
  userAuthenticate,
  OrderController.getOrderById
)

export default CartRouter;
