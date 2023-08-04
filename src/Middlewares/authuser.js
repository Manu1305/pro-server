const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const ErrorResponse = require("../utilis/errorResponse");
const dotenv = require("dotenv");

// .env path
dotenv.config({path:"../config/.env"}); 

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  console.log("TOKEN", token);
  console.log("JWT SECRET", process.env.JWT_SECRETE);

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRETE);
    const user = await Users.findById(decode.id);

    if (!user) {
      return next(new ErrorResponse("No user found with this id", 404));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Not Authorized to access this route", 401));
  }
};

module.exports = authMiddleware;
