const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Payment = require("../models/Payment");
const crypto = require("crypto");
const ErrorResponse = require("../utilis/errorResponse");
const User = require("../models/userModel");

dotenv.config({ path: "../config/.env" });

// create instance for create plan
const instance = new Razorpay({
  key_id: process.env.RAZORPAT_API_KEY_ID,
  key_secret: process.env.RAZORPAT_API_SECRET_KEY,
});

const createSubPlan = async (req, res) => {
  try {
    const ack = await instance.plans.create({
      period: "yearly",
      interval: 1,
      item: {
        name: "Hitech Premium account",
        amount: 9999 * 100,
        currency: "INR",
        description: "Premium Subscriber",
      },
      notes: {
        notes_key_1: "Tea, Earl Grey, Hot",
        notes_key_2: "Tea, Earl Grey… decaf.",
      },
    });

    res.status(200).json(ack);
  } catch (error) {
    console.log(error);
  }
};

// seller subscription
const subscription = async (req, res) => {
  // RAZORPAT_PLAN_ID
  const { name, email, phone, password, gst, urType, address, shopName } =
    req.body.userData;

  try {
    // razorpay
    const razAck = await instance.subscriptions
      .create({
        plan_id: process.env.RAZORPAT_PLAN_ID,
        customer_notify: 1,
        quantity: 1,
        total_count: 1,
        notes: { email },
      })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
      });

    //  hash password here
    const salt = await bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(password, salt);


    // register user
    const user = new User({
      profilePicture: "sdn",
      name,
      email,
      phone,
      password :hashedpassword,
      urType,
      subsPlan: "active",
      shopName,
      gst,
      address,
    });

    const userAck = await user.save();

    res.status(200).json({ razAck, userAck });
  } catch (error) {
    console.log(error);
  }
};

const subVerification = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    req.body;


  console.log(
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature
  );
  if (!req.params.id) {
    return res.status(500).json({ success: false, error: "please try again" });
  }
  try {
    const body = razorpay_payment_id + "|" + razorpay_subscription_id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAT_API_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    const isAuth = generatedSignature === razorpay_signature;

    console.log("REQ ID", req.query);

    console.log("+++++++++++++++++++++", isAuth);
    if (isAuth) {
      // store razorpay payment Details
      const payments = await Payment.create({
        razorpay_payment_id,
        razorpay_order_id: razorpay_subscription_id,
        razorpay_signature,
        paidFor: "Subscription",
      });

      const startDate = new Date();
      const expDate = new Date(); // coz could have got numreic values

      // create 1 year exp date
      expDate.setFullYear(expDate.getFullYear() + 1);

      // creating user subscription
      const createSubs = await User.findByIdAndUpdate(req.query.userId, {
        subscription: {
          subsStatus: "active",
          startDate,
          expDate,
          payId: razorpay_payment_id,
        },
      });

      await createSubs.save();
      await payments.save();
      return res.redirect(`https://hitecmart.com/login`);
    } else {
      return next(new ErrorResponse("Signature dosen't match", 401));
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { subVerification, subscription, createSubPlan };
