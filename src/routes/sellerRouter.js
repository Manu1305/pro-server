const express = require("express");
const router = express.Router();

const  authMiddleware  = require('../Middlewares/authuser');
const {sellerDash, getSellerWithdrawDetails} = require("../controllers/sellerController")


router.get("/seller-dash",authMiddleware, sellerDash);
router.get("/seller-admin-withdrawDetails",authMiddleware, getSellerWithdrawDetails);

module.exports = router;