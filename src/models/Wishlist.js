
const mongoose = require("mongoose");

const Schema = mongoose.Schema;


let WishSchema = new Schema({
    
        userId: {
          type: String,
          required: true,
        },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  
} ,)


module.exports = mongoose.model("Wish", WishSchema);