const express = require("express");
const router = express.Router();
const authMiddleware = require('../Middlewares/authuser')


const {
  addAddress,
  updateAddress,
  getSavedaddress,
  deleteAddress
} = require("../controllers/addressController");

// Create Order
router.post("/add-address",authMiddleware, addAddress);

// update Order
router.put("/update-address",authMiddleware, updateAddress);
router.delete("/delete-address/:itemId", authMiddleware, deleteAddress);

router.get("/savedaaddress", authMiddleware, getSavedaddress);
module.exports = router;
