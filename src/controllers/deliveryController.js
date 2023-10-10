const { refundCheckout } = require("../helper/refund");
const Order = require("../models/Order");
const WithdrawModule = require("../models/WithdrawModule");
const User = require("../models/userModel");
const ErrorResponse = require("../utilis/errorResponse");
const PackageDetails = require("../models/PackageDetailsModel");

// siign delivery
const assignDelivery = async (req, res) => {
  console.log("Allow delivery");
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Product not found" });
    }

    const updateProduct = await Order.findByIdAndUpdate(req.params.id, {
      isAssignDlv: true,
      orderStatus: "Dispatched 1",
    });

    console.log(updateProduct);

    res
      .status(201)
      .json({ success: true, ack: "Delivery Assigned successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

const dashboradDlvData = async (req, res) => {
  try {
    const allorder = await Order.find({ isAssignDlv: true });
    res.status(200).json(allorder);
  } catch (error) {
    res.json({ message: error });
  }
};


// picked from seller
const orderPicked = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const _id = req.params.id;

    if (!_id) next(new ErrorResponse("Order not found", 401));

    const order = await Order.findByIdAndUpdate(_id, {
      orderStatus: "Shipped",
    });

    res.status(200).json(order);
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

// refund initaite
const deliveryConfirmation = async (req, res, next) => {
  try {
    const _id = req.params.id;

    if (!_id) next(new ErrorResponse("Order not found", 401));

    // Get the current order from the database
    const order = await Order.findById(_id);

    // Check if the order exists in the database
    if (!order) next(new ErrorResponse("Order not found", 404));

    // Define the fields and their updated values based on the current orderStatus
    const updateFields = {
      orderStatus:
        order.orderStatus === "Collected Product"
          ? "confirm Return"
          : "confirm Delivery",
    };

    // Update the order using Order.findByIdAndUpdate
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true,
    });

    console.log(
      "Payment ID",
      updatedOrder.raz_paymentId,
      +"\n" + "Price",
      updatedOrder.ordPrc
    );

    // refund initiate                                   ----------- \helper
    const refundStatus = await refundCheckout(
      updatedOrder.raz_paymentId,
      updatedOrder.ordPrc
    );

    console.log(refundStatus);

    res.status(200).json({ status: updatedOrder, refundStatus });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

// delivey confirmation
const adminDlvConfirmation = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("Working");
    if (!id) return next(new ErrorResponse("Order not found", 401));

    // Find the order by ID
    const order = await Order.findById(id);

    // If order id not found, return an error
    if (!order) return next(new ErrorResponse("Id Not Found", 404));

    // retrun exp date
    const expDate = createExpDate();
    if (order.orderStatus === "confirm Delivery") {
      order.ordRetData = {
        retExpDate: expDate,
      };
    }

    // Update the order status based on the current status
    order.orderStatus =
      order.orderStatus === "confirm Delivery"
        ? "Delivered"
        : "Return Successful";
    await order.save();

    const check = await WithdrawModule.find({ orderId: order._id })

    console.log("ECHECK", check.length)

    if (check.length === 0) {
      console.log("worked")
      let data = await WithdrawModule.create({
        userId: order.userId,
        orderId: order._id,
        seller: order.seller,
        amount: order.ordPrc,
        // need to add amount for perticular product
        utr: null,
        date: order.createdAt,
        withdrawStatus: "Pending",
      });
      // console.log("Data", data);
      await data.save();
    }


    const withdraws = res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

// assign delivery
const assignReturnDelivery = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Product not found" });
    }

    const updateReturnOrder = await Order.findByIdAndUpdate(req.params.id, {
      orderStatus: "Return Initiated",
    });

    res
      .status(201)
      .json({ success: true, ack: "Return Delivery Assigned successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
    }
  }
};

//picked by delivery guy from buyer
const returnOrderPicked = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const _id = req.params.id;

    if (!_id) next(new ErrorResponse("Order not found", 401));

    const order = await Order.findByIdAndUpdate(_id, {
      orderStatus: "Collected Product",
    });

    res.status(200).json(order);
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

//delivered from delivery guy end waititng from admin approval
const returnConfirmation = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const _id = req.params.id;

    if (!_id) next(new ErrorResponse("Order not found", 401));

    const order = await Order.findByIdAndUpdate(_id, {
      orderStatus: "confirm Return",
    });

    res.status(200).json(order);
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

// creating redeem data for seller
const AdminReturnConfirmation = async (req, res, next) => {
  try {
    // console.log(req.params.id);
    const id = req.params.id;

    if (!id) next(new ErrorResponse("Order not found", 401));

    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: "Return Succesfull",
      },
      { new: true }
    );

    // if order id not found
    if (!order) next(new ErrorResponse("Id Not Found", 404));

    // console.log("Order Delivered", order);

    const existingData = await WithdrawModule.find({ orderId: order.Id });

    console.log("Existing", existingData);
    //already not there then store in withdreaw collection
    if (existingData.length == 0) {
      order.products.forEach(async (element) => {
        const { images } = element;
        if (req.user.email !== element.seller) {
          let data = await WithdrawModule.create({
            userId: order.userId,
            orderId: order._id,
            seller: element.seller,
            amount: order.totalAmount,
            // need to add amount for perticular product
            utr: null,
            date: order.createdAt,
            withdrawStatus: "Pending",
          });
          console.log("Data", data);
          await data.save();
        }
      });
    }

    res.status(200).json(order);
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

const allRefunds = async (req, res) => {
  const refunda = await instance.refunds.all(options);
};

//uploading TrackingID
const updateTrackId = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Order Request not found" });
    }

    const updateTrackId = await Order.findByIdAndUpdate(
      req.params.id,
      {
        trackId: req.body.trackId,
      },
      { new: true }
    );

    res.status(201).json({ success: true, ack: updateTrackId });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

// packageDetails like Wg, hg

const PckgDetail = async (req, res) => {
  try {
    const pckgDetail = await PackageDetails.find({
      orderId: req.params.orderId,
    });

    res.status(200).json(pckgDetail);
  } catch (error) {
    res.json({ message: error });
  }
};

const createExpDate = () => {
  const current1 = new Date(); //new Date();

  const currentDate = new Date(current1);
  const threeDaysFromNow = new Date(currentDate);
  threeDaysFromNow.setDate(currentDate.getDate() + 3);

  // Check if the result exceeds the last day of the current month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  if (threeDaysFromNow.getDate() > lastDayOfMonth) {
    threeDaysFromNow.setDate(lastDayOfMonth);
  }

  // Check if the result exceeds the last day of the current year
  const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31).getDate();
  if (threeDaysFromNow.getDate() > lastDayOfYear) {
    threeDaysFromNow.setDate(lastDayOfYear);
  }
  return threeDaysFromNow;
};


// only admin ==> update oreder status 
const updateOrdStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Order Request not found" });
    }

    const updateStatus = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: req.body.orderStatus,
      },
      { new: true }
    );

    res.status(201).json({ success: true, ack: updateStatus });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

module.exports = {
  dashboradDlvData,
  assignDelivery,
  orderPicked,
  deliveryConfirmation,
  adminDlvConfirmation,
  assignReturnDelivery,
  returnOrderPicked,
  returnConfirmation,
  AdminReturnConfirmation,
  updateTrackId,
  PckgDetail,
  updateOrdStatus
};