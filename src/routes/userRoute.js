const express = require("express");

const router = express.Router();
const Users = require("../models/userModel");
var nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config({ path: "./src/config/.env" });
const JWT_SECRETE = process.env.JWT_SECRETE;
console.log(JWT_SECRETE);
const authMiddleware = require("../Middlewares/authuser");
const {
  getAllUser,
  loginApi,
  signUpApi,
  updateUser,
  forgetpassword,
  updatePassword,
  updateProfile,
  sendOTP,
  verifyOtp,
  allUsers
} = require("../controllers/userController");

// login api
router.post("/login", loginApi);

// register user
router.post("/signup", signUpApi);

// update user
router.patch("/login/:id", authMiddleware, updateUser);

// updat ptofile
router.patch("/updateProfile",authMiddleware, updateProfile);

// forgetpassword//
router.post("/forgetpassword", forgetpassword);

// update password
router.put("/updatePassword", updatePassword);

// subscription

// get all users     ------Admin
router.get("/allUserData", getAllUser);


router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtp);
 

module.exports = router;
