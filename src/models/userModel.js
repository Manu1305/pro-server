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
  },
  { timestamps: true }
);

// befor updating user collection
// UserSchema.pre("save", async function (next) {
//     console.log("HI MAnu")
//     console.log(this.password)

//   if (!this.isModified("password")) {
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = bcrypt.hashSync(this.password, salt);
//   } 
//   else if (this.isModified("password")) {
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = bcrypt.hashSync(this.password, salt);
//   } 
//   else {

//     next()
//   }

// });

// login match password
UserSchema.methods.matchPasswords = async function (password) {
  console.log(this.password)
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRETE, {
    expiresIn: "1d",
  });
};

const users = mongoose.model("User", UserSchema);

module.exports = users;
