

const express = require("express");
// const authMiddleware = require("../Middlewares/authuser");
const router = express.Router();
const {
  dashboradDlvData,
  assignDelivery,
  deliveryConfirmation,
  orderPicked,
  adminDlvConfirmation,
  returnOrderPicked,
  returnConfirmation,
  AdminReturnConfirmation,
  assignReturnDelivery,
  updateTrackId,
  PckgDetail
} = require("../controllers/deliveryController");
const authMiddleware = require("../Middlewares/authuser");

// ?delivery Admin dashboard
router.get("/dashboradDlvData", dashboradDlvData);
router.get("/PckgDetail/:orderId", PckgDetail);
router.put("/update-trackId-request/:id",authMiddleware, updateTrackId);


// admin assign delivery
router.put("/assign-delivery-product/:id", assignDelivery);
router.put("/order-shipped/:id", orderPicked);
router.put("/order-deliverd/:id", deliveryConfirmation);
router.put("/delivered/:id", authMiddleware, adminDlvConfirmation);
router.put("/assign-return-delivery-order/:id", assignReturnDelivery);
router.put("/return-order-shipped/:id", returnOrderPicked);
router.put("/return-order-delivery/:id", returnConfirmation);
router.put("/return-Sucess/:id", authMiddleware, AdminReturnConfirmation);



module.exports = router;