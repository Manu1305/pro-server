const ReturnOrder = require("../models/ReturnOrderModel");

const ReturnProd = async (req, res) => {
  const {
    paymentId,
    images,
    productIssue,
    phone,
    uname,
    orderId,
    seller,
    amount,
  } = req.body;

  const imageBase64 = Object.values(images);



  console.log(imageBase64)
  try {
    

    // const user = new ReturnOrder({ ...ReturnOrderData, allRet: false });

    const newReturnOrder = new ReturnOrder({
      orderId,
      userId: req.user.id,
      paymentId,
      seller,
      uname,
      phone,
      productIssue,
      images:imageBase64,
      amount,
      retStatus: false,
    });

    const ack = await newReturnOrder.save();

    const allData = await ReturnOrder.find();
    // console.log(allData);
    res.status(200).json(ack);

  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error);
    if (error.code === 11000) {
      res.status(500).send({ code: errorCode, errorMessage });
      return;
    }
    res.status(500).send({ code: errorCode, errorMessage });
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
  ReturnProd, getAllReturn, removeRequestedReturn
};