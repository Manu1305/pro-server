const mongoose = require("mongoose");
const { model } = require("mongoose");

const Order = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hitec_products",
      required: true,
    },
    prdData: {
      type: Object,
      required: true,
    },
    sizeAndQua: {
      type: Object,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    ordPrc: {
      type: Number,
      required: true,
    },
    isAssignDlv: {
      type: Boolean,
    },
    quantity: {
      type: Number,
      required: true,
    },
    raz_paymentId: {
      type: String,
      // required: true,
      default: "",
    },
    raz_orderId: {
      type: String,
      // required: true,
      default: "",
    },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    pkgDeta: {
      type: Object,
      ref: "Seller",
    },
    dlvAddr: {
      type: Object,
      required: true,
    },
    pType: {
      type: Object,
      required: true,
    },
    pickAdd: {
      type: Object,
      required: true,
    },
    trackId: {
      type: Number,
      required: false,
    },
    ordRetData: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = new model("Orders", Order);