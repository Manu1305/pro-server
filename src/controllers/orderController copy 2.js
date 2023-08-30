const Order = require("../models/Order");
const Product = require("../models/productModel");
const users = require("../models/userModel");
// CREATE
const createOrder = async (req, res) => {
  const userId = req.user.id;

  // update
  const { products, address } = req.body;

  // res.send(products.items)

  try {


    for (const everyProduct of products) {
      const { productId, sizeAndQua, productDetails } = everyProduct;

      // get the product from database
      const existingProduct = await Product.findById(productId);

      const targetColor = productDetails.color


      // match color
      const updateColorQua = existingProduct.productDetails.find((prod) =>
        prod.color === targetColor
      )



      // checking quantities
      let checkQua;
      if (updateColorQua) {
        checkQua = Object.keys(sizeAndQua).every(size =>
          updateColorQua.qtyAndSizes[size] >= sizeAndQua[size]
        )

      } else {
        // give quantiy error
        res.status(403).json({error:"Qunatity error"})
      }



      // quantity is available place an order

      if (checkQua) {
        // substarct quantities from the found object
        Object.keys(sizeAndQua).forEach(size => {
          updateColorQua.qtyAndSizes[size] -= sizeAndQua[size];
        });
      }

      existingProduct


      // place order


    }

  } catch (error) {
    console.log(error);
  }
};

// UPDATE => only admin can update

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByAndUpdate(
      req.params.id,
      {
        $set: req.body,
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
    console.warn("type orc", req.user.email);
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

// const

module.exports = { createOrder, updateOrder, allOrders };
