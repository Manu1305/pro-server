const mongoose = require("mongoose");



const productDetail = new mongoose.Schema({
  color: {
    type: String,
    require: true
  },
  qtyAndSizes: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    require: true
  },

});

const products = new mongoose.Schema(
  {
    seller: {
      type: String,
      required: true,
      default: "M"
    },
    productCode: {
      type: String,
      required: true,
    },
    realPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
    },
    productDetails: {
      type: [productDetail],
      required: true,
    },
    selectedCategory: {
      type: String,
      required: true,
    },
    selectedSubcategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    publishDate: {
      type: Date,
      required: false
    }
    ,
    // totalQuantity: {
    //   type: Number,
    //   required: false,
    //   default: 0,
    // },

    WashcareInstructions: {
      type: String,

    },

    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: Boolean,
      required: true,
      default: false
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("hitec_product", products);
