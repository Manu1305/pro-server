const mongoose = require("mongoose");

const selectedSizes = new mongoose.Schema(
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
  },
);

const productDetail = new mongoose.Schema({

  selectedSizes: {
    type: selectedSizes,
    required: true,
  },
  brand: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },  primaryColor: {
    type: String,
    required: true,
  },
  otherColors: {
    type: String,
    required: false,
  },

});
const products = new mongoose.Schema(
  {
    seller: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    sellingPrice: {
      type: Number,
    },
    productDetail: {
      type: productDetail,
      required: true,
    },
    images: [],
    createDate: {
      type: Date,
      default: Date.now,
    },
    selectedCategory: {
      type: String,
      required: true,
    },
    selectedSubcategory: {
      type: String,
      required: true,
    },
    realPrice: {
      type: Number,
      required: true,
    },
  
    totalQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    WashcareInstructions: {
      type: String,
      default: 0,
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
    isAllowed: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("hitec_product", products);
