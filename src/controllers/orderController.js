const Order = require("../models/Order");
const Product = require("../models/productModel");
const users = require("../models/userModel");
// CREATE
const createOrder = async (req, res) => {
  const userId = req.user.id;

  // update
  const { products, address } = req.body;

  console.log("Address", address);

  try {
    // Check the availability of product quantities

    let allProducts = products.items;

    for (const everyProduct of allProducts) {
      const { productId, sizeWithQuantity } = everyProduct;
      console.log(productId);

      // get the product from database
      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // check if the provided quantities are availabe for each item(size)
      for (const [size, quantity] of Object.entries(sizeWithQuantity)) {
        // console.log(size, quantity);
        const availableQuantity =
          existingProduct.productDetail.selectedSizes[size]?.quantities;

        if (quantity.quantities > availableQuantity) {
          return res.status(401).json({
            error: `Insufficient quantities for ${quantity.selectedSizes}`,
          });
        }
      }
    }

    // if quantity is available place order

    const createdOrders = products.items.map(async (element) => {

      console.log("element", element)
      const sellerAdd = await users.find({
        email: element.productDetails.seller,
      });


      const order = new Order({
        userId,
        productId: element.productId,
        prdDeta: element.productDetails,
        sizeWithQuantity: element.sizeWithQuantity,
        seller: element.productDetails.seller,
        ordPrc: element.totalPrice,
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


    const allplacedOreders = Promise.all(createdOrders)
    // Update database after placed order
    for (const product of products.items) {
      const { productId, sizeWithQuantity } = product;

      // get the ordered product from databse
      const existingProduct = await Product.findById(productId);

      if (existingProduct) {
        // Update the Product quantities for each size
        for (const [size, quantity] of Object.entries(sizeWithQuantity)) {
          if (existingProduct.productDetail.selectedSizes[size]?.quantities) {
            console.log(
              "CHECK",
              existingProduct.productDetail.selectedSizes[size].quantities
            );
            existingProduct.productDetail.selectedSizes[size].quantities -=
              quantity.quantities;
          }
        }
        // const user = new Order({ ...existingProduct, isAllowed: false });
        // const ack = await user.save();
        await existingProduct.save();
      }
    }

    const orders = await Order.find({ orderStatus: "Pending" });

    const ids = orders.map((order) => order._id);

    res.status(200).json({ message: "Order placed", ids });
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
