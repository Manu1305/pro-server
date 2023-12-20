const Notification = require("../models/Notifications");
const Products = require("../models/productModel");
const User = require("../models/userModel");
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
    // const allproduct = await Products.find().sort({ _id: -1 });
    const allproduct = await Products.aggregate([
      {
        $match: {
          "productDetails": { $elemMatch: { "images.0": { $exists: true } } }
        }
      },
      {
        $project: {
          sellingPrice: 1,
          title: 1,
          image: { $arrayElemAt: ["$productDetails.images", 0] }
        }
      },
      {
        $sort: {
          _id: -1 // Sort by the _id field in descending order to get new items first
        }
      }
    ])



    // const allproduct = await Products.aggregate([
    //   {
    //     $match: {
    //       "productDetails": { $elemMatch: { "images.0": { $exists: true } } }
    //     }
    //   },
    //   {
    //     $unwind: "$productDetails"
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       sellingPrice: 1,
    //       title: 1,
    //       image: { $arrayElemAt: ["$productDetails.images", 0] }
    //     }
    //   }
    // ])
    
    ;
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
    console.log("USer", req.user)
    console.log("Details ", genInfo);

    const product = new Products({
      ...genInfo,
      productInfo,
      seller: req.user.email,   //add middleware
      longitude: 12.34,
      latitude: 12.34
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
  try {
    const qtyAndSizes = JSON.parse(req.body.qtyAndSizes);
    const color = req.body.color;
    const images = req.files.map((ele) => ele.location);

    const prices = req.body.prices

    console.log("USer", req.user);

    console.log("color", prices)

    const product = await Products.findById(req.params.productId);

    const quantites = Object.values(qtyAndSizes);

    const checkColors = color.split(',')

    product.productDetails.push({
      qtyAndSizes,
      color: checkColors.length > 1 ? checkColors : req.body.color,
      images,

    });

    if (prices) {
      product.prices = JSON.parse(prices)
    }
    // adding stocks
    (product.stock =
      product.stock +
      quantites.reduce(function (a, b) {
        return a + b;
      }, 0));

    const ack = await product.save();

    res.status(200).json({ success: true, message: ack, });
  } catch (error) {
    console.log(error)
  }
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

    res.send({ success: true, message: "Empty records", });
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

    console.log(req.body.status)

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


const runQyeries = async (req, res) => {

  // const ack = ["655dc52abfc41cf69b5d1ede", "655de016bfc41cf69b5f74f0", "655de5f2bfc41cf69b604b41", "655de46abfc41cf69b5fff79", "655de38abfc41cf69b5fe310", "655de016bfc41cf69b5f74f0", "655ddf8ebfc41cf69b5f7036", "655ddeeebfc41cf69b5f6b7e", "655dde35bfc41cf69b5f621c", "655ddd4abfc41cf69b5f5416", "655ddb02bfc41cf69b5f01e9", "655dda06bfc41cf69b5efd33", "655dd8a6bfc41cf69b5ee1e4", "655dd7b5bfc41cf69b5edd3a", "655dd68fbfc41cf69b5ecb3d", "655dd5d0bfc41cf69b5ec698", "655dd324bfc41cf69b5eafaf", "655dccdcbfc41cf69b5ddbe1", "655dcb96bfc41cf69b5d9158", "655dca92bfc41cf69b5d7faf"].map(async (item) => {
  //   const prodcut = await Products.findByIdAndUpdate(item, {
  //     seller: "sohaibansari197@gmail.com",
  //     latitude: 12.976619629165834,
  //     longitude: 77.71858994414023
  //   },
  //     function (err, docs) {
  //       if (err) {
  //         console.log("Error",err)
  //       }
  //       else {
  //         console.log("Updated User : ", docs);
  //       }
  //     }
  //   )

  //   await prodcut.save()

  // })


  // const products = await Products.findByIdAndUpdate("6548e724a05dcf17bad3b72a",

  //     {
  //       $set: {
  //         sellingPrice: {
  //           $add: [
  //             "$sellingPrice",
  //             {
  //               $subtract: [9, { $mod: ["$sellingPrice", 10] }]
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   ,
  //   { new: true }
  //   ,
  //   function (err, result) {
  //     if (err) {
  //       console.error("Error =====", err);
  //       res.status(5000).json(err)
  //     } else {
  //       res.status(200).json({ message: `${result} products updated successfully.`, result })
  //       console.log(`${result} products updated successfully.`);
  //     }
  //   }
  // )


  // price updated to last didgit 9
  // const ack = await   // Find documents with a price field
  //   Products.find({ sellingPrice: { $exists: true } }, (err, products) => {
  //     if (err) {
  //       console.error('Error finding products:', err);
  //     } else {
  //       // Update the last digit of the price field to 9
  //       products.forEach(product => {
  //         const currentPrice = product.sellingPrice;
  //         if (typeof currentPrice === 'number') {
  //           const updatedPrice = parseInt(currentPrice.toString().slice(0, -1) + '9');

  //           // Update the document with the new price
  //           Products.findByIdAndUpdate(
  //             product._id,
  //             { $set: { sellingPrice: updatedPrice } },
  //             { new: true },
  //             (updateErr, updatedProduct) => {
  //               if (updateErr) {
  //                 console.error('Error updating product:', updateErr);
  //               } else {
  //                 console.log('Updated product:', updatedProduct);
  //               }
  //             }
  //           );
  //         }
  //       });
  //       console.log(products)
  //     }
  //   });
  // // console.log(ack)




  // find query
  // const ack = await Products.find({}, { brand: 1, title: 1, status: 1, id: 0 })
  // res.send(ack)



 const ack =  await  User.updateMany({}, { $set: { isOwnStore: false } }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${result.nModified} users updated successfully`);
    }

  });
  res.send(ack)
}



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
  runQyeries
};



