
const Subscription = require("../models/Subscription");
const Users = require("../models/userModel");
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const twilio = require('twilio');
const accountSid = "AC6c272cfafb0075585f6f26abf6a891be";
const authToken = "45432b06534978cb31dcb6c2b1de62cb";
const verifySid = "VAa8e71f48525eb30c8d34654c6eeb1d4e";
const client = require("twilio")(accountSid, authToken);
dotenv.config({ path: "../config/.env" })
const bcrypt = require("bcrypt");
var unirest = require("unirest");

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

      const { name, email, phone, password, gst, urType, address, shopName } =
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

      return res.status(200).json({ register: ack, subscription: saveSub });
    } else {
      const { name, email, phone, password, gst, urType } = userData;
      const salt = await bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(password, salt);
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

    // send mail using optional parameters
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

// creating token
async function sendToken(user, statusCode, res) {
  let token = await user.getSignedToken();
  delete user.password;
  res.status(statusCode).json({
    user,
    token,
  });
}
  

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

const sendOTP = async (data, res) => {

  console.log(data.body + "this is req.body")
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
    if (res.error) throw new Error(res.error);
  
    console.log(res.body);
  });

}

const verifyOtp = async function (req, res) {

if(req.body.phoneOtp==otp){
  res.send({ message: "success" });
  console.log('varified')
}
else{
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
      status:!req.body.actStatus
    });

    console.log(updateUser);

    res.status(201).json({ success: true, ack: updateUser });
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
  userActivate

};
