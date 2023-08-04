const express = require("express");
const router = express.Router();

const  authMiddleware  = require('../Middlewares/authuser');
const {ReturnProd, getAllReturn, removeRequestedReturn} = require("../controllers/ReturnController")


router.post("/return-prod",authMiddleware, ReturnProd);
router.get("/returnReq",authMiddleware, getAllReturn);
router.delete("/remove-requested-return/:id", removeRequestedReturn);





module.exports = router;