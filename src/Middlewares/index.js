exports.requireSignin = (req, res, next) => {
  const token = req.adminMiddleware;
};

exports.userMiddleware = (req, res, next) => {};

exports.sellerMiddleware = (req, res, next) => {
  if (req.res.urType !== "seller") {
    return res.status(400).json({ message: "Access Denied" });
  }
  next();
};

exports.adminMiddleware = (req, res, next) => {
  if (req.res.urType !== "admin") {
    return res.status(400).json({ message: "Access Denied" });
  }
  next();
};
