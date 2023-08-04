const express = require("express");
const router = express.Router();

const  authMiddleware  = require('../Middlewares/authuser');
const {WithdrawDetails, getWithdrawDetails, acceptWithdrawRequest} = require("../controllers/WithdrawController")


router.post("/request-withdraw/:id",authMiddleware, WithdrawDetails);
router.get("/getwithdraw",authMiddleware, getWithdrawDetails);
router.put("/accept-withdraw-request/:id",authMiddleware, acceptWithdrawRequest);


module.exports = router;