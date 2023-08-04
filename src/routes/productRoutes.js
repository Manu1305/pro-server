const express = require("express");
const router = express.Router();

const  authMiddleware  = require('../Middlewares/authuser');


const {
  getAllProduct,
  requestedProducts,
  allowRequestedProducts,
  addNewProduct,
  removeRequestedProducts,
  updateProduct,
} = require("../controllers/productController");

router.post("/add-new-product", addNewProduct);

router.get("/get-all-products", getAllProduct);

router.post("/requested-Products", requestedProducts);

router.put("/allow-requested-product/:id", allowRequestedProducts);

router.put("/remove-requested-product/:id", removeRequestedProducts);

// update product / increase quantity
router.put("/update-seller-product/:id", updateProduct);



module.exports = router;
