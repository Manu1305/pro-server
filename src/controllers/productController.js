const Notification = require("../models/Notifications");
const Products = require("../models/productModel");
const ErrorResponse = require("../utilis/errorResponse");
const Adminfee = require("../models/Adminfee");
const AWS = require("@aws-sdk/client-s3")
const dotenv = require('dotenv')


dotenv.config({ path: "'../../src/config/.env" });


// create instance
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_KEY,
  },
  region: process.env.REGION
});

const getAllProduct = async (req, res) => {
  try {
    const allproduct = await Products.find().sort({ _id: -1 });
    res.status(200).json(allproduct);
  } catch (error) {
    res.json({ message: error });
  }
};

const getOneProduct = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const getOneproduct = await Products.findById(productId);

    if (!getOneproduct)
      next(
        new ErrorResponse({ suucess: false, messgae: "Product not found" }, 404)
      );

    res.status(200).json(getOneproduct);
  } catch (error) {
    console.log(error + "fetching one product error ");
  }
};

// add new Product
const addNewProduct = async (req, res) => {
  try {
    const productInfo = req.body.productInfo;
    const genInfo = req.body.genInfo;

    console.log("Details ", genInfo);
    console.log("uuuuu ", req.user);

    const product = new Products({
      ...genInfo,
      productInfo,
      seller: req.user.email,
      longitude: req.user.longitude,
      latitude: req.user.latitude,
    });
    const ack = await product.save();

    res.status(200).json(ack);
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

const productColorImages = async (req, res) => {
  const qtyAndSizes = JSON.parse(req.body.qtyAndSizes);
  const color = req.body.color;
  const images = req.files.map((ele) => ele.location);

  console.log("Files", req.files);


  const product = await Products.findById(req.params.productId);

  const quantites = Object.values(qtyAndSizes);

  product.productDetails.push({
    qtyAndSizes,
    color,
    images,
  });


  // adding stocks
  (product.stock =
    product.stock +
    quantites.reduce(function (a, b) {
      return a + b;
    }, 0));

  const ack = await product.save();
  res.status(200).json({ success: true, message: ack });
};

const requestedProducts = async (req, res) => {
  console.log(req.body.type);
  const { type, seller } = req.body;
  try {
    let requestedProducts;


    if (type === "admin") {
      requestedProducts = await Products.find({ status: "Pending" });
    }
    if (type === "seller") {
      requestedProducts = await Products.find({ seller: seller });
      requestedProducts.filter((prodcut) => prodcut.status === "Pending");
    }

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
      status: req.body.status,
    }, { new: true });

    res.status(201).json({ success: true, ack: updateProduct });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

// remove requested products
const removeRequestedProducts = async (req, res) => {
  try {
    const { heading, desc, email } = req.body.message;



    const updatedProduct = await Products.findById(req.params.id);

    // Delete img from aws 
    updatedProduct.productDetails.map(item => {
      item.images.map((ele) => {
        console.log(ele)
        const getExtension = ele.split('.com/')
        const params = {
          Bucket: process.env.BUCKRT_NAME_PROD,
          Key: getExtension[1],
        };

        s3.deleteObject(params, (error, data) => {
          if (error) {
            res.status(500).send(error);
          } else {
            console.log(data);
          }

        });
      })
    })



    // const message = await updateProduct.save

    const deleteProduct = await Products.findByIdAndDelete(req.params.id)

    const newNoti = await Notification.create({
      // sellerId: email,
      heading: heading,
      message: desc,
      for: email,
    });

    const ack = newNoti.save();

    res.status(200).json({ message: ack, ack: deleteProduct });


  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// update product ---Akshay
const updateProduct = async (req, res, next) => {
  const productId = req.params.id;

  const { productInfo, generalDetails } = req.body;

  try {
    const updateProduct = await Products.findByIdAndUpdate(
      { _id: productId },
      {
        ...generalDetails,
        productInfo: { ...productInfo },
      },
      { new: true }
    );
    res.status(200).json({ success: true, ack: updateProduct });
  } catch (error) {
    return next(new ErrorResponse(error, 500));
  }
};

const uploadImages = async (req, res, next) => {
  const { file } = req;

  if (!file) return next(new ErrorResponse({ message: "Bad request" }, 500));

  return res.status("success");
};

// update size image and color
const updateSizeAndImg = async (req, res, next) => {


  try {

    const { index, qtyAndSizes, color, images } = req.body
    const product = await Products.findById(req.params.id);

    // console.log("Req Bory",images)

    product.productDetails[index].qtyAndSizes = qtyAndSizes;
    product.productDetails[index].color = color;
    product.productDetails[index].images = images;


    const ack = await product.save();
    res.status(200).json({ message: "success", ack })

  } catch (error) {
    console.log("Error", error);
  }

}

const adminfee = async (req, res) => {
  try {
    const fee = await Adminfee.findByIdAndUpdate(
      "6527bd184e54967fde21ac99",
      { fee: req.params.fee },
      {
        new: true,
      }
    );
    await fee.save();

    console.log("Check", fee);
    res.status(200).send("Fee saved successfully" + fee);
    // console.log(fees);
  } catch (error) {
    console.log(error);
  }
};


const findAdminfee = async (req, res) => {
  try {
    const fee = await Adminfee.findById("6527bd184e54967fde21ac99");
    res.status(200).json(fee);
  } catch (err) {
    console.log(err);
  }
};


// aws delete images from aws bucket

const deleteImages = async (req, res) => {

  const getExtension = req.body.filename.split('.com/')
  const params = {
    Bucket: process.env.BUCKRT_NAME_PROD,
    Key: getExtension[1], // req.body.url
  };

  try {
    s3.deleteObject(params, (error, data) => {
      if (error) {
        res.status(500).send(error);
      } else {
        console.log(data);
      }

    });

    const product = await Products.findById(req.params.id);


    const fromIndex = product.productDetails[`${req.body.index}`].images.indexOf(req.body.filename)


    product.productDetails[`${req.body.index}`].images.splice(fromIndex, 1)
    const ack = await product.save()

    res.status(200).send({ message: "File has been deleted successfully", ack });



  } catch (err) {
    console.error(err);
  }

};



module.exports = {
  getAllProduct,
  addNewProduct,
  requestedProducts,
  allowRequestedProducts,
  removeRequestedProducts,
  updateProduct,
  getOneProduct,
  uploadImages,
  productColorImages,
  adminfee,
  findAdminfee,
  updateSizeAndImg,
  deleteImages,
};



