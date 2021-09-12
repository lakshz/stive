const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user.js");

router.get("/:id", auth, async (req, res) => {
  try {
    const matchedUser = await User.findOne({ _id: req.params.id });
    if (req.user.id == matchedUser.id) {
      res.render("profile", {
        id: req.params.id,
        fullname: matchedUser.fullname,
        username: matchedUser.username,
        followers: matchedUser.follower,
        following: matchedUser.following,
        img: matchedUser.img,
        streams: matchedUser.streams,
      });
    } else {
      res.render("otherProfile", {
        otherid: req.params.id,
        myid: req.user.id,
        fullname: matchedUser.fullname,
        username: matchedUser.username,
        followers: matchedUser.follower,
        following: matchedUser.following,
        img: matchedUser.img,
        streams: matchedUser.streams,
      });
    }
  } catch (e) {
    res.render("noUserFound", {
      id: req.user.id,
    });
  }
});

module.exports = router;
