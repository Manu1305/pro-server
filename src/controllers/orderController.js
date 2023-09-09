const Order = require("../models/Order");
const Product = require("../models/productModel");
const users = require("../models/userModel");

// CREATE
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { products, address, } = req.body;

  try {

    // mapping through every cart item
    for (const everyProduct of products.items) {
      const { productId, sizeAndQua, productDetails } = everyProduct;

      // get the product from database
      const existingProduct = await Product.findById(productId);

      const targetColor = productDetails.color


      // match color
      const updateColorQua = existingProduct.productDetails.find((prod) =>
        prod.color === targetColor
      )
      const indexOfColor = existingProduct.productDetails.findIndex((prod) =>
        prod.color === targetColor
      )


      // checking quantities
      // let checkQua;
      // if (updateColorQua) {
      //   checkQua = Object.keys(sizeAndQua).every(size =>
      //     updateColorQua.qtyAndSizes[size] >= sizeAndQua[size]
      //   )

      // } else {
      //   // give quantiy error
      //   res.status(403).json({ error: "Qunatity error" })
      // }



      // quantity is available place an order
      // if (checkQua) {
      //   // substarct quantities from the found object    
      //   Object.keys(sizeAndQua).forEach(size => {  
      //     existingProduct.productDetails[indexOfColor].qtyAndSizes[size] -= sizeAndQua[size];
      //   });
      // }
    }

    // if quantity is available place order
    const createdOrders = products.items.map(async (element) => {


      // get seller address
      const sellerAdd = await users.find({
        email: element.productDetails.seller,
      });

      const order = new Order({
        userId,
        productId: element.productId,
        prdData: element.productDetails,
        sizeAndQua: element.sizeAndQua,
        seller: element.productDetails.seller,
        ordPrc: element.itemPrice,
        isAssignDlv: false,
        quantity: element.totalQuantity,
        raz_paymentId: "",
        raz_orderId: "",
        orderStatus: "Pending",
        pkgDeta: {},
        dlvAddr: address,
        pickAdd: {
          address: sellerAdd[0].address,
          phone: sellerAdd[0].phone,
          name: sellerAdd[0].name,
        },
        trackId: null,

        pType: "",
      });

      return await order.save();
    });

    console.log("createdOrders",createdOrders)


    const allplacedOreders = await Promise.all(createdOrders)


    console.log("allplacedOreders",allplacedOreders)

    const orders = await Order.find({ orderStatus: "Pending" });

    const ids = orders.map((order) => order._id);

    res.status(200).json({ message: "Order placed", ids ,placedOrder:allplacedOreders});

  } catch (error) {
    console.log(error);
  }
};

// UPDATE => only admin can update

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus:"Cancelled",
      },
      { new: true }
    );

    res.json(200).status(updatedOrder);
  } catch (error) {
    console.log(error);
  }
};

// user order history for admin/seller/user
const allOrders = async (req, res) => {
  try {
    // console.log("type orc", req.user.email);
    // let orders = await Order.find({ userId: req.user.id })

    let orders;
    if (req.user.urType === "admin") {
      orders = await Order.find();
    } else if (req.user.urType === "seller") {
      orders = await Order.find({ seller: req.user.email });
      console.log(orders);
    } else {
      orders = await Order.find({ userId: req.user.id });
    }

    

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};


module.exports = { createOrder, updateOrder, allOrders };
