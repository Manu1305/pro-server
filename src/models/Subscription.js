const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  subsStatus: {
    type: String,
    default: "inActive",
  },
  startDate: {
    type: Date,
  },
  expDate: {
    type: Date,
  },
  payId: {
    type:String,
  }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;