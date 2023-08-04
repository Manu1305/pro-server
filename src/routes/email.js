
var nodemailer = require('nodemailer');
const { getMaxListeners } = require('../models/userModel');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "manukrishnan858@gmail.com",
      pass: "irhtckhjsdubnpin"
    }
 });

var mailOptions = {
  from: 'manukrishnan858@gmail.com',
  to: 'manukrishnan1305@gmail.com',
  subject: 'Sending Email using Node.jssdvhjkcdvjk',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});