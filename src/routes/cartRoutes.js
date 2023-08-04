const express = require("express");
const authMiddleware = require("../Middlewares/authuser");
const router = express.Router();
const {
  addToCart,
  getUserCart,
  deleteCartItem,
} = require("../controllers/cartController");

router.post("/add-to-cart", authMiddleware, addToCart);
router.get("/user-cart", authMiddleware, getUserCart);
router.delete("/delete-cart-item/:itemId", authMiddleware, deleteCartItem);

module.exports = router;
