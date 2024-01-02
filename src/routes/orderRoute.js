const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middlewares/authuser");

const {
  createOrder,
  updateOrder,
  allOrders,
  singleOrder,
  // getAdminOrders
} = require("../controllers/orderController");

// Create Order
router.post("/placeOrder/:paymentType", authMiddleware, createOrder);

// update Order
router.put("/update-order/:id", updateOrder);

// get orders by type
router.get("/get-all-orders",authMiddleware,allOrders);

// get only admin orders
// router.get('/admin-orders',authMiddleware,getAdminOrders)

//get order details
router.get("/getSingleorder/:id",authMiddleware,singleOrder);

module.exports = router;