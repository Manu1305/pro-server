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


      // target color 
      const targetColor = productDetails.color

      // match color
      const updateColorQua = existingProduct.productDetails.find((prod) =>
        prod.color === targetColor
      )

      // check quantity
      let isQuantityAvailable = Object.keys(sizeAndQua).every((size) => {
        return updateColorQua.qtyAndSizes[size] && updateColorQua.qtyAndSizes[size] >= sizeAndQua[size];
      });

      console.log("isQuantityAvailable", isQuantityAvailable);

      if (!isQuantityAvailable) {
        return res.status(401).json({ message: `Quantity is not available for the ${productDetails.brand}` })
      }


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
        quantity: 0,
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


    // decrease qunatity after placing an order
    products.items.forEach(async element => {
      const { productId, sizeAndQua, productDetails } = element
      // console.log(element)

      // update orders
      const updateOreders = await Product.findById(productId);
      // console.log("updateOreders", updateOreders);


      const targetColor = productDetails.color


      let index;
      // match color
      const updateColorQua = updateOreders.productDetails.find((prod, ind) => {
        index = ind
        return prod.color === targetColor
      }
      );

      // update quantity
      for (const size in sizeAndQua) {
        if (sizeAndQua.hasOwnProperty(size) && updateColorQua.qtyAndSizes.hasOwnProperty(size)) {
          updateColorQua.qtyAndSizes[size] -= sizeAndQua[size];
        }
      };
      // console.log("index", index)
      // console.log("updateColorQua", updateColorQua)
      updateOreders.productDetails[index] = updateColorQua
      await updateOreders.save()





    });


    const allplacedOreders = await Promise.all(createdOrders)


    const orders = await Order.find({ orderStatus: "Pending" });

    const ids = orders.map((order) => order._id);

    res.status(200).json({ message: "Order placed", ids, placedOrder: allplacedOreders });

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


    let orders;
    if (req.user.urType === "admin") {
      orders = await Order.find();
    } else if (req.user.urType === "seller") {
      orders = await Order.find({ seller: req.user.email });
    } else {
      orders = await Order.find({ userId: req.user.id });
    }



    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};


module.exports = { createOrder, updateOrder, allOrders };
