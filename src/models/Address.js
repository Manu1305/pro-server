const mongoose = require("mongoose");

const AddressScema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    addressDetails: {
      name: {
        type: String,
        required: false,
      },
      locality: {
        type: String,
        required: false,
      },
      area: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
        minLength: [6, "Should have minimum 6 digits"],
        maxLength: [6, "Should have maximum 6 digits"],
      },
      phone: {
        type: Number,
        required: true,
        minLength: [10, "Number should have minimum 10 digits"],
        maxLength: [10, "Number should have maximum 10 digits"],
      },
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Addresses", AddressScema);

module.exports = Address;
