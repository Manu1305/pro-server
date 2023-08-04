const express = require("express");
const authMiddleware = require("../Middlewares/authuser");
const router = express.Router();
const {
    addToWish,
    getWishproducts,
} = require("../controllers/Wish");

router.post("/update-wish", authMiddleware, addToWish);
router.get("/user-wish", authMiddleware, getWishproducts);

module.exports = router;