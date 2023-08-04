const Notification = require("../models/Notifications");
const Order = require("../models/Order");
const PackageDetails = require("../models/PackageDetailsModel");
const WithdrawModule = require("../models/WithdrawModule");
const ErrorResponse = require("../utilis/errorResponse");
// seller dashbpoard
const sellerDash = async (req, res) => {
  // const { email } = req.bo;
  console.log("Email", req.user.email);

  try {
    const salesStatus = await Order.find({
      "products.seller": req.user.email,
    }).exec();
    console.log(salesStatus);
    res.send(salesStatus);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error);
    res.status(500).send({ code: errorCode, errorMessage });
  }
};

// seller withdraw details
const getSellerWithdrawDetails = async (req, res) => {
  console.log(req.user.email);

  let withdreawDetails;
  if (req.user.urType === "admin") {
    console.log("admin");
    withdreawDetails = await WithdrawModule.find({
      withdrawStatus: "Requested",
    });
  } else {
    console.log("seller", req.user.email);
    withdreawDetails = await WithdrawModule.find({ seller: req.user.email });
  }

  res.status(200).json(withdreawDetails);
};

// order ready for pick up
const readyToPickUp = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { packageDetails } = req.body;

    const updateOrder = await Order.findById(orderId);

    if (!updateOrder) next(new ErrorResponse("Order not found", 401));

    updateOrder.orderStatus = "Ready To PickUp";

    const deliveryDetails = new PackageDetails({
      orderId,
      packageDetails,
    });

    const savePkgDet = await deliveryDetails.save();
    const updatedOrder = await updateOrder.save();
    res.status(200).json({ updatedOrder, savePkgDet });
  } catch (error) {
    next(new ErrorResponse(error, 500));
  }
};

// get seller notifications
const getSellerNoti = async (req, res, next) => {
  try {
    const allNotifications = await Notification.find({
      sellerId: req.user.email,
    });

    res.send(allNotifications);
  } catch (error) {
    next(new ErrorResponse(error, 500));
  }
};

module.exports = {
  sellerDash,
  readyToPickUp,
  getSellerWithdrawDetails,
  getSellerNoti,
};
