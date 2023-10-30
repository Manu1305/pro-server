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
      // required: true,
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
      // required: true,
      default:[]
    },
    selectedCategory: {
      type: String,
      required: true,
    },
    selectedSubcategory: {
      type: String,
      required: true,
    },
    collections: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productInfo: {
      Material: {
        type: String,
        required: true,
      },
      Packoff: {
        type: String,
        required: true,
      },
      Closure: {
        type: String,
        required: true,
      },
      Fit: {
        type: String,
        required: true,
      },
      Pattern: {
        type: String,
        required: true,
      },
      Idealfor: {
        type: String,
        required: true,
      },
      Washcare: {
        type: String,
      },
      Convertible: {
        type: String,
        required: true,
      },
    },
    publishDate: {
      type: Date,
      required: false
    },
    stock: {
      type: Number,
      // required: true,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    MoreDetails: {
      type: String,
      required: false,
      default:null
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
      type: String,
      required: true,
      default: "Pending"
    },
    tags: {
      type: String,
      required: false,
      default:"Shist"
      // default: false
    },
   
  },

  { timestamps: true }
);

module.exports = mongoose.model("hitec_product", products);
