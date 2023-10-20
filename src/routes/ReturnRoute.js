const express = require("express");
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3')
const dotenv = require("dotenv");

dotenv.config({ path: "../config/env" });

const AWS = require("@aws-sdk/client-s3")

const  authMiddleware  = require('../Middlewares/authuser');
const {ReturnProd, getAllReturn, removeRequestedReturn} = require("../controllers/ReturnController")


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
      // console.log("FILES",file)      //check here
      cb(null, { fieldname: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
});


router.post("/return-prod",authMiddleware,upload.array('images', 4),ReturnProd);
router.get("/returnReq",authMiddleware, getAllReturn);
router.delete("/remove-requested-return/:id", removeRequestedReturn);




module.exports = router;