const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.render("login", {
    error: null,
  });
});

router.post("/", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const matchedUser = await User.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, matchedUser.password);

    if (isMatch) {
      const token = await matchedUser.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60),
        httpOnly: true, // cannot be changed
      });

      const id = matchedUser._id;
      res.redirect(`../index/${id}`);
    } else {
      throw new Error();
    }
  } catch (e) {
    res.render("login", {
      error: "User not found",
    });
  }
});

module.exports = router;
