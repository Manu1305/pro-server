const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "../config/.env" });

const UserSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
      unique: true,
      validator: [validator.isEmail, "please enter valid Email ID"],
    },
    phone: {
      type: Number,
      require: [true, "Error: Enter Phone Number Above"],
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    urType: {
      type: String,
      require: true,
    },
    subsPlan: {
      type: String,
      default: "Normal",
      ref: "Seller",
    },
    gst: {
      type: String,
    },
    shopName: {
      type: String,
      require: false,
    },
    address: {
      pincode: {
        type: Number,
        require: true,
      },
      locality: {
        type: String,
        require: true,
      },
      area: {
        type: String,
        require: false,
      },
      city: {
        type: String,
        require: false,
      },
      country: {
        type: String,
        require: true,
      },
      state: {
        type: String,
        require: true,
      },
    },

    storeSetup: {
      type: Boolean,
      require: false,
      default: false,
    },
    subscription: {
      subsStatus: {
        type: String,
        default: "inActive",
        required: false,
      },
      startDate: {
        type: Date,
        required: false,
      },
      expDate: {
        type: Date,
        required: false,
      },
      payId: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);
UserSchema.methods.matchPasswords = async function (password) {
  console.log(this.password);
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRETE, {
    expiresIn: "30d",
  });
};

const users = mongoose.model("User", UserSchema);

module.exports = users;
