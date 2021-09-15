const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const rzpInstance = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

router.post("/create", (req, res) => {
  const options = {
    amount: req.body.amount * 100,
    currency: "INR",
  };

  rzpInstance.orders.create(options, (err, order) => {
    res.json(order);
  });
});

router.post("/verify", (req, res) => {
  const body = req.body.orderId + "|" + req.body.response.razorpay_payment_id;

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", "Wok5mJv2F0pa5HKLeXZfUr9r")
    .update(body.toString())
    .digest("hex");
  // console.log("sig received ", req.body.response.razorpay_signature);
  // console.log("sig generated ", expectedSignature);
  const response = { signatureIsValid: false };
  if (expectedSignature === req.body.response.razorpay_signature) {
    response = { signatureIsValid: true };
  }
  res.send(response);
});

module.exports = router;
