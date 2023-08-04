const mongoose = require("mongoose");
const { model } = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    paymentDetails: {
      type: Object,
      required: false,
    },
    paidFor: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = new model("payments", paymentSchema);  