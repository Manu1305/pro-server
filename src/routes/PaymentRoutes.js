const express = require("express");
const router = express.Router();
const {
  checkout,
  paymentVerification,
  getApiKey,
  refundCheckout,
  refundVerification,
} = require("../controllers/PaymentController");

router.post("/pay", checkout);
router.post("/payment-verification/:ids", paymentVerification);
router.get("/get-api-key", getApiKey);

router.post("/refund-checkout/:orderId", refundCheckout);
router.post("/refund-checkout-verificaton", refundVerification);

module.exports = router;
