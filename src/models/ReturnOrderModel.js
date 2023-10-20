const mongoose = require("mongoose");
const { model } = require("mongoose");

const ReturnOrder = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "users",
    },
    seller: {
      type: String,
      required: false,
    },
    uname: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    productIssue: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      require: true
    },

    amount: {
      type: Number,
      required: false,
    },

    paymentId: {
      type: String,
    },
    retStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = new model("ReturnOrder", ReturnOrder);