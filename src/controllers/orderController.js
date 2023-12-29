const Cart = require("../models/Cart");
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
      const targetColor = typeof (productDetails.color) === "object" ? productDetails.color[0] : productDetails.color

      // match color
      const updateColorQua = existingProduct.productDetails.find((prod) => {
        const color = typeof (prod.color) === 'object' ? prod.color[0] : prod.color;
        return color === targetColor
      }
      )

      // check quantity
      let isQuantityAvailable = Object.keys(sizeAndQua).every((size) => {
        return updateColorQua.qtyAndSizes[size] && updateColorQua.qtyAndSizes[size] >= sizeAndQua[size];
      });


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
        quantity: element.totalQuantity,
        raz_paymentId: "",
        raz_orderId: "",
        orderStatus: req.user.isOwnStore ? "Placed" : "Pending",
        pkgDeta: {},
        dlvAddr: address,
        pickAdd: {
          address: sellerAdd[0].address,
          phone: sellerAdd[0].phone,
          name: sellerAdd[0].name,
        },
        trackId: null,
        paymentDetails: "",

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


      const targetColor = typeof (productDetails.color) === "object" ? productDetails.color[0] : productDetails.color


      let index;
      // match color
      const updateColorQua = updateOreders.productDetails.find((prod, ind) => {
        index = ind
        const color = typeof (prod.color) === 'object' ? prod.color[0] : prod.color;
        return color === targetColor
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
      updateOreders.productDetails[index] = updateColorQua;
      const quantites = Object.values(sizeAndQua);
      updateOreders.stock = updateOreders.stock - quantites.reduce(function (a, b) { return a + b; }, 0);
      await updateOreders.save()
    });


    const allplacedOreders = await Promise.all(createdOrders)


    const orders = await Order.find({ orderStatus: "Pending" });

    // console.log(orders)

    const ids = orders.map((order) => order._id);


    console.log("Ids",ids)



    const emptyCart = await Cart.findOneAndDelete({userId});


    res.status(200).json({ message: "Order placed", ids, placedOrder: allplacedOreders,emptyCart });


  } catch (error) {
    console.log(error);
  }
};

// UPDATE => only admin can update


const updateOrder = async (req, res) => {
  const { products } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: "Cancelled",
      },
      { new: true }
    );

    // Loop through the products in the request body
    for (const element of products) {
      const { productId, sizeAndQua } = element;

      // Find the product by its ID
      const updateProduct = await Product.findById(productId);

      // Check if the product exists
      if (!updateProduct) {
        console.log(`Product with ID ${productId} not found`);
        continue;
      }

      // Loop through the sizes and quantities in the request
      for (const size in sizeAndQua) {
        if (sizeAndQua.hasOwnProperty(size)) {
          // Update the product's size and quantity
          if (updateProduct.productDetails[size]) {
            updateProduct.productDetails[size] += sizeAndQua[size];
          } else {
            updateProduct.productDetails[size] = sizeAndQua[size];
          }
        }
      }

      // Save the updated product
      await updateProduct.save();
    }

    res.status(200).json(updatedOrder); // Corrected response handling
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle errors gracefully
  }
};


// user order history for admin/seller/user
const allOrders = async (req, res) => {
  try {


    let orders;
    if (req.user.urType === "admin") {
      orders = await Order.find().sort({ _id: -1 });
    } else if (req.user.urType === "seller") {
      orders = await Order.find({ seller: req.user.email }).sort({ _id: -1 });
    } else {
      orders = await Order.find({ userId: req.user.id }).sort({ _id: -1 });
    }


    // const filterdOrders = orders.filter(ele => ele.orderStatus !== "Pending");


    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
  }
};

const singleOrder = async (req, res, next) => {
  const orderId = req.params.id

  try {
    const getOneOrder = await Order.findById(orderId)
    if (!getOneOrder) next(new ErrorResponse({ success: false, messgae: "order Not found" }, 404))
    res.status(200).json(getOneOrder);
  }
  catch (error) {
    console.log(error + 'fetching one product error ')
  }
}






module.exports = { createOrder, updateOrder, allOrders, singleOrder };
