const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
        bankName: {
          type: String,
          required: false,
        },
         Name: {
            type: String,
            required: false,
          },
        AccountNumber: {
          type: Number,
          required: false,
        },
        ifsc: {
          type: String,
          required: false,
        },
        Branch: {
          type: String,
          required: false,
        }
    
  },
  { timestamps: true }
);

const bankDetails = mongoose.model("bankDetails", BankSchema);

module.exports = bankDetails;
