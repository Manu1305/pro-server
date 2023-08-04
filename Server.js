const express = require("express");
const mongoose = require("mongoose");
const mongoURL = "mongodb://127.0.0.1:27017";
const dotenv = require("dotenv");
const dbName = "storing";
const userRouter = require("./src/routes/userRoute");
const productRouter = require("./src/routes/productRoutes");
const orderRoute = require("./src/routes/orderRoute");
const bodyParser = require("body-parser");
const addressRouter = require('./src/routes/addressRoute');
const cartRouter = require('./src/routes/cartRoutes');
const statusRouter = require('./src/routes/orderStatusRoute');
const deliveryRouter = require('./src/routes/deliveryRoute');
const paymentRouter = require('./src/routes/PaymentRoutes');
const bankRouter = require('./src/routes/BankDetails');
const withdrawRouter = require("./src/routes/WithdrawRoutes")
const ReturnOrder = require("./src/routes/ReturnRoute")
const updateWishlistRouter = require('./src/routes/wishRoutes')
const sellerRouter = require("./src/routes/sellerRouter");
const subsRouter = require("./src/routes/subRoute")
const notifRouter = require("./src/routes/notiRoute")
dotenv.config({ path: './src/config/.env' });


console.log("helo")
console.log(process.env.JWT_SECRETE)

const app = express();
const cors = require("cors");

// setting limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// to read data in json format
app.use(express.json());

// cors policy
app.use(
  cors({
    permissionsPolicy: {
      features: {
        chUaFormFactor: false,
      },
    },
  })
);

const db = mongoose.connection;

mongoose.connect(`${mongoURL}/${dbName}`);

db.on("error", (error) => {
  console.log("db not connected", error);
});

db.once("open", () => {
  console.log("Database connected successfully");
});

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/orders", orderRoute);
app.use("/address", addressRouter);
app.use("/cart", cartRouter);
app.use('/status', statusRouter)
app.use('/delivery', deliveryRouter)
app.use('/payment', paymentRouter)
app.use("/Bankdetails", bankRouter);
app.use("/wish", updateWishlistRouter)
app.use("/withdraw", withdrawRouter);
app.use("/return", ReturnOrder);
app.use("/seller", sellerRouter);
app.use("/subscription", subsRouter);
app.use("/noti", notifRouter);

const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`app is running At port ${PORT}`);
});
