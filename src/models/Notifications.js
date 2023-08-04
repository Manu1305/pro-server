const mongoose = require("mongoose");

const Notifications = new mongoose.Schema(
  {
    for: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("notifications", Notifications);

module.exports = Notification;
