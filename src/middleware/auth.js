const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.JWT_KEY);

    const userData = await User.findOne({ _id: verifyUser._id });
    req.token = token;
    req.user = userData;
    next();
  } catch (e) {
    res.status(401).redirect("/login");
  }
};

module.exports = auth;
