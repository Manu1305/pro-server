const express = require("express");
const Razorpay = require("razorpay");
const { subscription, subVerification, createSubPlan, } = require("../controllers/subscriptionController");
const authMiddleware = require("../Middlewares/authuser");


const router = express.Router();

// create plan  => for practice purpose
router.route("/create_subscription_plan").get(createSubPlan);


// get subscription
router.route("/subscriptions").post(subscription);


// subscription verification
router.post("/subscription-verfivation/:id",subVerification);

// router.get('/check',check)

module.exports = router;