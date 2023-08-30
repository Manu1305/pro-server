const Notification = require("../models/Notifications");
const Products = require("../models/productModel");

const getAllProduct = async (req, res) => {
  try {
    const allproduct = await Products.find({ status: true });
    res.status(200).json(allproduct);
    console.log("sent")
  } catch (error) {
    res.json({ message: error });
  }
};

// add new Product
const addNewProduct = async (req, res) => {


  // const { seller, productId, realPrice, sellingPrice, productDetails, selectedCategory, selectedSubcategory, brand, description,material } = req.body
  console.log(req.body);

  try {
 

    const product = new Products({ ...req.body,  });
    const ack = await product.save();
    
   res.send(ack);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error);
    if (error.code === 11000) {
      res.status(500).send({ code: errorCode, errorMessage });
      return;
    }
    res.status(500).send({ code: errorCode, errorMessage });
  }
};
// ----------------Admin access-------------------
// Requested products from seller and Admin

const requestedProducts = async (req, res) => {
  console.log(req.body.type);
  const { type, seller } = req.body;
  try {
    let requestedProducts;

    if (type === "admin") {
      requestedProducts = await Products.find({ status: false });
    }
    if (type === "seller") {
      requestedProducts = await Products.find({ seller: seller });
      requestedProducts.filter((prodcut) => prodcut.status === false);
    }

    console.log("DATA", requestedProducts);
    if (requestedProducts) {
      return res.status(200).json(requestedProducts);
    }

    res.send({ success: true, message: "Empty records" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//allow requested products
const allowRequestedProducts = async (req, res) => {
  console.log(req.params.id);
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "Product not found" });
    }

    const updateProduct = await Products.findByIdAndUpdate(req.params.id, {
      status: true,
    });

    console.log(updateProduct);

    res.status(201).json({ success: true, ack: "Product added successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

// remove requested products
const removeRequestedProducts = async (req, res) => {
  console.log(req.params.id);

  try {
    const { heading, desc, email } = req.body.message;
    const updatedProduct = await Products.findByIdAndDelete(req.params.id);
    console.log(updatedProduct);


    const newNoti = await Notification.create({
      // sellerId: email,
      heading: heading,
      message: desc,
      for: email
    });

    const ack = newNoti.save();

    res.status(200).json({ message: ack, ack: "Product deleted....!" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// update product ---Akshay
const updateProduct = async (req, res, next) => {
  // const productId = req.params.id;

  const { size, total } = req.body;

  try {
    // const id = new ObjectId(req.params.id)
    const updateProduct = await Products.findById(req.params.id);

    if (!updateProduct) next(new ErrorResponse("Product not found", 401));
    // update all quantites
    Object.keys(size).forEach((key, index) => {
      const sizeKey = `size${index + 1}`;
      updateProduct.productDetail.selectedSizes[sizeKey].quantities += parseInt(
        size[key],
        10
      );
    });

    // update qunatity
    // updateProduct.totalQuantity = updateProduct.totalQuantity + parseInt(total);

    console.log(updateProduct.totalQuantity);
    const ack = updateProduct.save();
    res.status(200).json({ success: true, msg: updateProduct });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

module.exports = {
  getAllProduct,
  addNewProduct,
  requestedProducts,
  allowRequestedProducts,
  removeRequestedProducts,
  updateProduct,
};
