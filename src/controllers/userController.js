
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


// const getAllUser = async (req, res) => {
//   try {
//     const allUser = await Users.find();
//     res.status(200).json(allUser);

//   } catch (error) {
//     res.json({ message: error });
//   }

// };
const getAllUser = async (req, res) => {
  try {
    const allUser = await Users.find();
    res.status(200).json(allUser);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
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
      // if buyer
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
      res.status(500).send({ code: errorCode, errorMessage });
      return;
    }
    res.status(500).send({ error });
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
      <img style="width:100px;height:40px;object-fit:contain" src="https://hitecmart.in/Image/loho.jpeg" alt="Your Logo">
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

//
const sendOTP = async (req, res) => {
  console.log(req.body + "this is req.body")
  const phone = '+91' + req.body.phone;

  client.verify.v2.services
    .create({ friendlyName: 'hitecmart login' })
    .then(service => console.log(service.sid))

  client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: "sms" })
    .then((verification) => console.log(verification.status))
    .then(() => {

    });
}


const verifyOtp = async function (req, res) {

  const otpCode = req.body.phoneOtp;
  const phone = '+91' + req.body.phone;


  console.log("otpCode", otpCode);
  console.log("phone", phone);
  client.verify
    .services(verifySid)
    .verificationChecks.create({ to: phone, code: otpCode })
    .then((verification_check) => {
      console.log(verification_check.status);
      res.json({ status: verification_check.status });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Verification failed' });
    });
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
  verifyOtp

};
