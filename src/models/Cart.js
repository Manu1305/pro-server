
const mongoose = require("mongoose");

const Schema = mongoose.Schema;


let ItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  sizeAndQua: {
    type: Object,
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
  productDetails: {
    type: Object,
    require: true,
  },

  itemPrice: {
    type: Number,
    required: true,
  },
});

const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [ItemSchema],
    subTotal: {
      default: 0,
      type: Number,
    },
  },
  { timeseries: true }
);

module.exports = mongoose.model("Cart", CartSchema);