const mongoose = require("mongoose");
const { model } = require("mongoose");

const Withdraw = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "users",
    },
    seller:{
      type:String,
      required:true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
      ref: "Orders",
    },
    amount: {
      type: Number,
      required: true,
    },
    withdrawStatus: {
      type: String,
      default: "Pending",
    },
    utr: {
      type: Number,
      required: false,
    },
    payReq: {
      type: Boolean,
      // require: true,
    },
    date: {
      type:String
    }
  },
  { timestamps: true }
);


module.exports = new model("Withdraw", Withdraw);