const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const connectDB = () => {
  try {
    mongoose.set("strictQuery", false);

    const db = mongoose.connection;
    mongoose.connect(`${process.env.MONGO_URL_STRING}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db.on("error", (error) => {
      console.log("db not connected", error);
    });

    db.once("open", () => {
      console.log("Database connected successfully");
    });

    // console.log(db.collections)
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
