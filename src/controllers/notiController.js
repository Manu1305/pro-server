const Notification = require("../models/Notifications");
const ErrorResponse = require("../utilis/errorResponse");

// create notification for seller
const createNotification = async (req, res, next) => {
  try {
    console.log(req.body.message);
    const { heading, desc ,forU} = req.body.message;
console.log(forU)
    const newNoti = await Notification.create({
      for:forU,
      heading: heading,
      message: desc,
    });

    const ack = newNoti.save();
    res.status(200).json(ack);
  } catch (error) {
    console.log(error);
    next(new ErrorResponse(error, 500));
  }
};

const getNotifications = async (req, res, next) => {
  try {
    let allNtfs;
    console.log(req.user.urType);
    if (req.user.urType === "seller") {
      allNtfs = await Notification.find({ for: req.user.email });
      // return allNtfs;
    } else if (req.user.urType === "admin") {
      allNtfs = await Notification.find({ for: "admin" });
      // return allNtfs;
    }

    console.log(allNtfs);

    res.status(200).json(allNtfs);
  } catch (error) {
    console.log(error);
    next(new ErrorResponse(error, 500));
  }
};

module.exports = { createNotification, getNotifications };