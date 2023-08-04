const mongoose = require("mongoose");
const { model } = require("mongoose");

const PackageDetails = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    packageDetails: {
        type:Object,
        required:true
    },
},
  { timestamps: true }
);

module.exports = new model("PackgeDetails", PackageDetails);