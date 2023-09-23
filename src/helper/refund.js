const Razorpay = require("razorpay");

const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });


const instance = new Razorpay({
  key_id: process.env.RAZORPAT_API_KEY_ID_PROD,
  key_secret: process.env.RAZORPAT_API_SECRET_KEY_PROD,
});

// Normal method                     ------- refund
const refundCheckout = async (paymentId, refundAmount) => {
  console.log("PAyment ID 1111111111", paymentId);
  try {
    const refundInitiate = await instance.payments.refund(paymentId, {
      amount: refundAmount,
      speed: "normal",
      notes: {
        notes_key_1: "Beam me up Scotty.",
        notes_key_2: "Engage",
      },
    //   receipt: "Receipt No. 31",
    }).then((res) => {
        return res
    }).catch((Err) => {
        console.log("ERROR",Err)
        return Err
    })

    console.log("working", refundInitiate);
    return refundInitiate;
  } catch (error) {
    // console.log(error);
    return error;
  }
};

module.exports = { refundCheckout };
