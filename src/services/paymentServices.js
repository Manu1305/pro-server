const payuConfig = require('../config/payuConfig');
const axios = require('axios');

// Function to initiate the payment request to PayU
const initiatePayment = async (order, returnUrl) => {
  try {
    const requestBody = {
      ...payuConfig.paymentRequestData,
      order_id: order._id,
      amount: order.amount,
      merchant_id: payuConfig.merchantId,
      // Include other required parameters as per PayU documentation
      // ...
    };

    const response = await axios.post(payuConfig.paymentRequestUrl, requestBody);
    return response.data;
  } catch (error) {
    throw new Error('Failed to initiate payment');
  }
};

// Function to verify the payment status from PayU
const verifyPayment = async (orderId) => {
  try {
    const requestBody = {
      ...payuConfig.paymentVerificationData,
      order_id: orderId,
      merchant_id: payuConfig.merchantId,
      // Include other required parameters as per PayU documentation
      // ...
    };

    const response = await axios.post(payuConfig.paymentVerificationUrl, requestBody);
    return response.data;
  } catch (error) {
    throw new Error('Failed to verify payment');
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
};