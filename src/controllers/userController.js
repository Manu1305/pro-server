
const Subscription = require("../models/Subscription");
const Users = require("../models/userModel");
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const accountSid = "AC6c272cfafb0075585f6f26abf6a891be";
const authToken = "45432b06534978cb31dcb6c2b1de62cb";
dotenv.config({ path: "../config/.env" })
const bcrypt = require("bcrypt");
var unirest = require("unirest");
const Products = require("../models/productModel");
const moment = require('moment');

var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");




const getAllUser = async (req, res) => {
  try {
    const allUser = await Users.find();
    res.status(200).json(allUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSingleUser = async (req, res) => {
  const emailid = req.params.id
  try {
    const User = await Users.findOne({ email: emailid });

    res.status(200).json(User);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

const loginApi = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not exist" });
    }
    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      return res.status(401).json({ message: "incorrect" });
    }

    sendToken(user, 200, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ err: "An error occurred" });
  }
};

const signUpApi = async (req, res) => {
  const { userData } = req.body;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hitecmart303@gmail.com",
      pass: "kvlflizslfiuxzse",
    },
  });


  const user = await Users.findOne({ email: userData.email });
  const phone = await Users.findOne({ phone: userData.phone });
  console.log(user + "this is email")

  if (user) {
    return res.send({ message: "emailexist" });
  }
  else if (phone) {
    return res.send({ message: "Phonexist" });
  }

  try {
    // 
    if (userData.urType === "seller") {
      const startDate = new Date();
      const expDate = new Date();

      // calculate one month
      expDate.setMonth(expDate.getMonth() + 1);

      const { name, email, phone, password, gst, urType, address, shopName, latitude, longitude } =
        userData;
      const salt = await bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(password, salt);

      // register user
      const user = new Users({
        profilePicture: "sdn",
        name,
        email,
        phone,
        password: hashedpassword,
        urType,
        subsPlan: "Noraml",
        shopName,
        gst,
        address,
        longitude,
        latitude
      });


      let ack = await user.save();
      console.log("ack", ack);

      // 1 month free subscription
      const subscription = await Subscription.create({
        userId: ack._id,
        subsStatus: "inActive",
        startDate,
        expDate,
      });

      const saveSub = subscription.save();

      var mailOptions = {
        from: "hitecmart303@gmail.com",
        to: ["manu@certontech.com", "support@hitecmart.com", ",akshay@certontech.com"],
        subject: "New seller signup",
        html: `
      <img style="width:100px;height:40px;object-fit:contain" src="data:image/jpeg;base64,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" alt="Hitecmart">
        <h2>new Seller created new account name is  ${name} ,phone is ${phone} </h2>
      `,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);

          return res.status(200).json({ success: true, message: info.response });
        }
      });


      return res.status(200).json({ register: ack, subscription: saveSub });
    }







    else {
      const { name, email, phone, password, gst, urType } = userData;
      const salt = await bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(password, salt);
      var mails = userData.email
      const user = new Users({
        profilePicture: "bsdmbn",
        name,
        email,
        phone,
        password: hashedpassword,
        urType,
        gst,
        subsPlan: "Not Applicable",
      });




      //welcome Email mesage
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "hitecmart303@gmail.com",
          pass: "kvlflizslfiuxzse",
        },
      });

      try {


        const payload = { email: email };

        // creating token with expiration



        // send mail using optional parameters
        var mailOptions = {
          from: "manukrishnan858@gmail.com",
          to: mails,
          subject: "Welcome to hitecmart",
          html: `
          
            <h2>Click>welcome to hitecmart ,your account created successfully</h2>
          `,
        };

        // get the response
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);

            return res.status(200).json({ success: true, message: info.response });
          }
        });
      } catch (err) {
        console.log(err);
      }

      let ack = await user.save();
      return res.send({ message: "success" });











    }
  } catch (error) {
    console.log(error);
    const errorCode = error.code;
    const errorMessage = error.message;
    if (error.code === 11000) {
      res.status(500).json({ code: errorCode, errorMessage });
      return;
    }
    res.status(500).json({ error });
  }
};

const updateUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "password",
    "phone",
    "address",
    "shopName",
    "address1",
    "address2",
    "selectedCountry",
    "city",
    "pincode",
    "selectedState",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalids updates!" });
  }

  try {
    const user = await Users.findById(req.params.id);
    updates.forEach((update) => user[update] === req.body[update]);

    await user.save();
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

const forgetpassword = async (req, res) => {
  const { email } = req.body;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hitecmart303@gmail.com",
      pass: "kvlflizslfiuxzse",
    },
  });

  try {
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const payload = { email: existingUser.email, id: existingUser.id };

    // creating token with expiration
    const token = jwt.sign(payload, process.env.JWT_SECRETE, { expiresIn: "15m" });
    const link = `https://hitecmart.com/forgotpassword/${existingUser.id}/${token}`;
    console.log(link);


    var mailOptions = {
      from: "manukrishnan858@gmail.com",
      to: email,
      subject: "Hitecmart password change link",
      html: `
      <img style="width:100px;height:40px;object-fit:contain" src="https://hitecmart.com/Image/loho.jpeg" alt="Your Logo">
        <h2>Click <a style="color:red;" href="${link}">Here</a> to update your password </h2>
      `,
    };

    // get the response
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);

        return res.status(200).json({ success: true, message: info.response });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const updatePassword = async (req, res) => {
  const { id, password } = req.body;

  try {
    // Update password without saving
    const updatedUser = await Users.findOne({ _id: id });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password and update the user document
    const salt = await bcrypt.genSaltSync(10);
    updatedUser.password = bcrypt.hashSync(password, salt);

    // Save the updated user
    await updatedUser.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
};



const updateProfile = async (req, res) => {

  const { _id } = req.user;
  console.log("req.user", req.user);
  const { name, phone } = req.body;

  const updateData = {
    $set: {
      name,
    },
  };

  if (phone) {
    updateData.$set.phone = phone;
  }

  const updatedUser = await Users.findByIdAndUpdate(_id, updateData, {
    new: true,
  });

  console.log(updatedUser);
  sendToken(updatedUser, 200, res);
};


var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

const sendOTP = async (data, res) => {

  console.log(data.body.phone + "this is req.body")
  const phone = data.body.phone;
  const usertype = await data.body.userType;
  req.query({
    "authorization": "BLHFvewrGpNhE56Wj1Y0z4qUAmnPt3VlaMQsSo2kJRdcgCTZDfu2zZ6g0rNfVT4KCcR1lODpBLwUHW7v",
    "sender_id": "HTCMRT",
    "message": 159934,
    "variables_values": `Hitecmart|${otp}`,
    "route": "dlt",
    "numbers": phone,
  });


  req.headers({
    "cache-control": "no-cache"
  });


  req.end(function (res) {
    if (res.error) {
      console.log("Any Error", res)
      return res.status(500).json(res.error)
    };

  });
  res.send({ message: "Otp sent succefully" })

}

const verifyOtp = async function (req, res) {

  if (req.body.phoneOtp == otp) {
    res.send({ message: "success" });
    console.log('varified')
  }
  else {
    res.send({ message: "failed" });
    console.log("wron otp")
  }
}


const userDeactivate = async (req, res) => {
  console.log(req.params.id);
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "User not found" });
    }

    const updateUser = await Users.findByIdAndUpdate(req.params.id, {
      status: !req.body.actStatus
    });

    let updatedProducts;

    if (updateUser.urType === 'seller') {

      const products = await Products.updateMany({ seller: updateUser.email }, { $set: { status: "unPublish" } })

      updatedProducts = products.save()

      console.log('Updated success fully')
    }

    console.log(updateUser);

    res.status(201).json({ success: true, ack: updateUser, product: updatedProducts ? updatedProducts : "No products" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};

const userActivate = async (req, res) => {
  console.log(req.params.id);
  try {
    if (!req.params.id) {
      return res.status(401).json({ error: "User not found" });
    }

    const updateUser = await Users.findByIdAndUpdate(req.params.id, {
      status: true,
    });

    console.log(updateUser);

    res.status(201).json({ success: true, ack: "success" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(500).send({ code: error.code, errorMessage });
      return;
    }
  }
};


// creating token
async function sendToken(user, statusCode, res) {
  let token = await user.getSignedToken();
  delete user.password;
  res.status(statusCode).json({
    user,
    token,
  });
}


const isOwnStoreStatus = async (req, res) => {
  try {
    const ack = await Users.findByIdAndUpdate(req.params.id,
      [{ $set: { isOwnStore: { $eq: [false, "$isOwnStore"] } } }],
      { new: true }
    );
    res.send(ack)
  } catch (error) {
    console.log(error)
  }
}

const onlineStatus = async (req, res) => {
  try {

    const userId = req.params.id

    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const checkuser = await Users.findById(userId)
    if (checkuser) {
      const statusChange = await Users.findByIdAndUpdate(userId, { $set: { online: currentDate } }, { new: true })
      res.status(200).json({ message: 'last seen updated', statusChange });

    }
    else {
      console.log('no user')
      res.status(401).json('no user found error')
    }

  } catch (error) {
    console.log(error, 'catch error')
  }
}






module.exports = {
  loginApi,
  signUpApi,
  updateUser,
  forgetpassword,
  updatePassword,
  updateProfile,
  getAllUser,
  sendOTP,
  verifyOtp,
  userDeactivate,
  userActivate,
  getSingleUser,
  isOwnStoreStatus,
  onlineStatus

};
