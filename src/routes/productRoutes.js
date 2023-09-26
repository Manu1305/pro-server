const express = require("express");
const router = express.Router();
const authMiddleware = require('../Middlewares/authuser');
const multer = require('multer');


const AWS = require("@aws-sdk/client-s3")
const dotenv = require("dotenv");
const multerS3 = require('multer-s3')
dotenv.config({ path: "../config/env" });

// const uploadToAWS = require("../cloud/S3");



const {
  getAllProduct,
  requestedProducts,
  allowRequestedProducts,
  addNewProduct,
  removeRequestedProducts,
  updateProduct,
  getOneProduct,
  productColorImages
} = require("../controllers/productController");








// create instance
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_KEY,
  },
  region: process.env.REGION
});


// middleware to upload images to cloud through multer
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKRT_NAME_PROD,
    // acl:'public-read',
    metadata: function (req, file, cb) {
      // console.log("FILES",file)
      cb(null, { fieldname: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
});


router.post("/add-new-product", authMiddleware, addNewProduct);
router.put("/product_color_images/:productId", authMiddleware, upload.array('images', 4), productColorImages);

router.get("/get-all-products", getAllProduct);

router.post("/requested-Products", requestedProducts);

router.put("/allow-requested-product/:id", allowRequestedProducts);


router.put("/remove-requested-product/:id", removeRequestedProducts);

// update product / increase quantity
router.put("/update-seller-product/:id", updateProduct);
router.get("/get-single-products/:id", getOneProduct);


module.exports = router;
