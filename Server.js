const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRouter = require("./src/routes/userRoute");
const productRouter = require("./src/routes/productRoutes");
const orderRoute = require("./src/routes/orderRoute");
const bodyParser = require("body-parser");
const addressRouter = require("./src/routes/addressRoute");
const cartRouter = require("./src/routes/cartRoutes");
const statusRouter = require("./src/routes/orderStatusRoute");
const deliveryRouter = require("./src/routes/deliveryRoute");
const paymentRouter = require("./src/routes/PaymentRoutes");
const bankRouter = require("./src/routes/BankDetails");
const withdrawRouter = require("./src/routes/WithdrawRoutes");
const ReturnOrder = require("./src/routes/ReturnRoute");
const updateWishlistRouter = require("./src/routes/wishRoutes");
const sellerRouter = require("./src/routes/sellerRouter");
const subsRouter = require("./src/routes/subRoute");
const notifRouter = require("./src/routes/notiRoute");

const connectDB = require("./src/config/db");

dotenv.config({ path: "./src/config/.env" });
const PORT = process.env.PORT;

const app = express();

// setting limit
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
// to read data in json format
app.use(express.json());

// cors policy
const corsOptions = {
  origin: ['https://hitecmart.com', "https://htmfashion.com",],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If you need to pass cookies or other credentials
  optionsSuccessStatus: 204, // For preflight requests
};

app.use(cors(corsOptions));

// routes
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/orders", orderRoute);
app.use("/address", addressRouter);
app.use("/cart", cartRouter);
app.use("/status", statusRouter);
app.use("/delivery", deliveryRouter);
app.use("/payment", paymentRouter);
app.use("/Bankdetails", bankRouter);
app.use("/wish", updateWishlistRouter);
app.use("/withdraw", withdrawRouter);
app.use("/return", ReturnOrder);
app.use("/seller", sellerRouter);
app.use("/subscription", subsRouter);
app.use("/noti", notifRouter);


const server = app.listen(PORT, () => {
  // db connection
  connectDB();
  console.log(`server is running At port ${PORT}`);
});

//if error occured
process.on("unhandledRejection", (err, promise) => {
  console.log(`CHECK ERROR AKSHAY : ${err}`);
  server.close(() => process.exit(1));
});
