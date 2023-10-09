const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { ObjectId } = require("mongodb");


const instance = new Razorpay({
  key_id: process.env.RAZORPAT_API_KEY_ID_PROD,
  key_secret: process.env.RAZORPAT_API_SECRET_KEY_PROD,
});



// order creation
const checkout = async (req, res, next) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  try {
    const order = await instance.orders
      .create(options)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
  }
};


const paymentVerification = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const pType = req.query.pType
  console.log("Params ID", typeof req.params.ids);
  console.log("Params ID", req.params.ids);

  console.log(razorpay_payment_id);

  if (!req.params.ids) {
    return res.status(500).json({ success: false, error: "please try again" });
  }
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAT_API_SECRET_KEY_PROD)
      .update(body.toString())
      .digest("hex");

    const isAuth = expectedSignature === razorpay_signature;
    if (isAuth) {
      // update placed order

      let ids = req.params.ids.split(",").map((id) => new ObjectId(id));

      const orderPromises = ids.map(async (element) => {
        const updatePlacedOrder = await Order.findByIdAndUpdate(
          element,
          {
            orderStatus: "Placed",
            raz_paymentId: razorpay_payment_id,
            raz_orderId: razorpay_order_id,
            pType

          },

          { new: true }
        );
        return await updatePlacedOrder.save();
      });
      // console.log(updatePlacedOrder);
      const allUpdatedOrds = await Promise.all(orderPromises);
      // store razorpay payment Details
      const payments = await Payment.create({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        paidFor: "Order",
      });

      await payments.save();
       

      const deletePendingOrders =await Order.deleteMany({orderStatus:"Pending"})
      return res.redirect(
        `https://hitecmart.com/payment_succesfull?reference=${razorpay_payment_id}`
      );
    } else {
      console.log("Please try agin");
      return res.status(400).json({ success: false });
    }
    // res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};


const getApiKey = async (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAT_API_KEY_ID_PROD });

// refund checkout
const refundCheckout = async (req, res) => {
  const orderId = req.params.orderId;
  const { paymentId, refundAmount } = req.body;


  console.log("refundAmount", refundAmount)
  console.log("paymentId", paymentId)

  // Normal payment method
  receiptNumber++;

  try {
    const refundInitiate = await instance.payments.refund(paymentId, {
      amount: refundAmount,
      speed: "normal",
      notes: {
        notes_key_1: "Beam me up Scotty.",
        notes_key_2: "Engage",
      },
      receipt: "Receipt No. 31"
    });
    return res.send(refundInitiate);
  } catch (error) {
    //  return next(new ErrorResponse)
    console.log(error);
    return res.status(500).json(error);
  }
};

// refund verification
const refundVerification = async () => { };

module.exports = {
  checkout,
  paymentVerification,
  getApiKey,
  refundCheckout,
  refundVerification,
};
