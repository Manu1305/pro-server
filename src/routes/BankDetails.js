const express = require("express");
const router = express.Router();
const authMiddleware = require('../Middlewares/authuser')


const {
    addBankdetails,
    getSavedBankData,
    getSavedBankDatas
} = require("../controllers/bankController");

router.post("/addBankData",authMiddleware, addBankdetails);
router.get("/getBankData/:email",authMiddleware, getSavedBankData);

module.exports = router;
