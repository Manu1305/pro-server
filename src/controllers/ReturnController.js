const ReturnOrder = require("../models/ReturnOrderModel");


const ReturnProd = async (req, res) => {
  try {

    const images = req.files.map((ele) => ele.location);


    const {
      paymentId,
      phone,
      uname,
      orderId,
      seller,
      amount,
    } = req.body;


    const productIssue= req.body.productIssue

    const newReturnOrder = new ReturnOrder({
      orderId,
      userId: req.user.id, // Assuming you have user authentication middleware
      paymentId,
      seller,
      uname,
      phone,
      productIssue,
      images,
      amount,
      retStatus: false,
    });

    const ack = await newReturnOrder.save();
    // Log the successful request here
    res.status(200).json({ success: true, data: ack });
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};


const getAllReturn = async (req, res) => {
  try {
    const returnProd = await ReturnOrder.find({ retStatus: false });
    res.status(200).json(returnProd);
  } catch (error) {
    res.json({ message: error });
  }
};

const removeRequestedReturn = async (req, res) => {
  console.log(req.params.id);

  try {
    const returnReqDel = await ReturnOrder.findByIdAndDelete(req.params.id);
    console.log(returnReqDel);

    res.status(200).json({ success: true, ack: "Return deleted....!" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

module.exports = {
  ReturnProd,
  getAllReturn,
  removeRequestedReturn,
};
