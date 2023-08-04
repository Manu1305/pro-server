
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const selectedSizes = new Schema(
  {
    size1: {
      selectedSizes: {
        type: String,
        required: false,
      },
      quantities: {
        type: Number,
        required: false,
      },
    },
    size2: {
      selectedSizes: {
        type: String,
        required: false,
      },
      quantities: {
        type: Number,
        required: false,
      },
    },
    size3: {
      selectedSizes: {
        type: String,
        required: false,
      },
      quantities: {
        type: Number,
        required: false,
      },
    },
    size4: {
      selectedSizes: {
        type: String,
        required: false,
      },
      quantities: {
        type: Number,
        required: false,
      },
    },
  }
  // { timestamps: true }
);

let ItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  sizeWithQuantity: {
    type: selectedSizes,
    required: true,
    // min: [5, "Quantity can not be less than 1."],
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
  productDetails: {
    type: Object,
    require: true,
  },

  totalPrice: {
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