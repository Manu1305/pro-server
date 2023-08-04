// const Withdraw = require("../models/WithdrawModule");
// const Orders = require("../models/Order");
// const WithdrawModule = require("../models/WithdrawModule");

// const WithdrawDetails = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const redeemRequest = await WithdrawModule.findByIdAndUpdate(
//       id,
//       {
//         withdrawStatus: "Requested",
//       },
//       { new: true }
//     );

//     res.status(200).json(redeemRequest);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const getWithdrawDetails = async (req, res) => {
//   try {
//     const allWithdraw = await Withdraw.find({ payReq: false });
//     res.status(200).json(allWithdraw);
//   } catch (error) {
//     res.json({ message: error });
//   }
// };


// const acceptWithdrawRequest = async (req, res) => {
//   console.log(req.params.id);
//   try {
//     if (!req.params.id) {
//       return res.status(401).json({ error: "Order Request not found" });
//     }

//     const updatedWithdraw = await Withdraw.findByIdAndUpdate(
//       req.params.id,
//       {
//         utr: req.body.utr,
//         withdrawStatus: req.body.withdrawStatus,
//       },
//       { new: true }
//     );

//     // console.log(updatedWithdraw);

//     res.status(201).json({ success: true, ack: updatedWithdraw });
//   } catch (error) {
//     if (error.code === 11000) {
//       res.status(500).send({ code: error.code, errorMessage });
//       return;
//     }
//   }
// };

// module.exports = { WithdrawDetails, getWithdrawDetails, acceptWithdrawRequest };


const Withdraw = require("../models/WithdrawModule");
const Orders = require("../models/Order");
const WithdrawModule = require("../models/WithdrawModule");

const WithdrawDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const redeemRequest = await WithdrawModule.findByIdAndUpdate(
      id,
      {
        withdrawStatus: "Requested",
      },
      { new: true }
    );

    res.status(200).json(redeemRequest);
  } catch (error) {
    console.log(error);
  }
};

const getWithdrawDetails = async (req, res) => {
  try {
    const allWithdraw = await Withdraw.find({ withdrawStatus: "Paid" });
    res.status(200).json(allWithdraw);
  } catch (error) {
    res.json({ message: error });
  }
};


const acceptWithdrawRequest = async (req, res) => {
  console.log(req.params.id);
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Order Request not found" });
    }

    const updatedWithdraw = await Withdraw.findByIdAndUpdate(
      req.params.id,
      {
        utr: req.body.utr,
        withdrawStatus: "Paid",
      },
      { new: true }
    );

    // console.log(updatedWithdraw);

    res.status(201).json({ success: true, ack: updatedWithdraw });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

module.exports = { WithdrawDetails, getWithdrawDetails, acceptWithdrawRequest };