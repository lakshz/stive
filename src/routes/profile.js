const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

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
      let isFollowing = false;
      matchedUser.follower.forEach((el) => {
        if (el.userId == req.user.id) {
          isFollowing = true;
          return;
        }
      });
      res.render("otherProfile", {
        otherid: req.params.id,
        myid: req.user.id,
        isFollowing: isFollowing,
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

router.patch("/:id/follow", auth, async (req, res) => {
  try {
    const otherUser = await User.findOne({ _id: req.body.otherid });
    const me = await User.findOne({ _id: req.body.myid });
    otherUser.follower = otherUser.follower.concat({ userId: req.body.myid });
    me.following = me.following.concat({ userId: req.body.otherid });
    await otherUser.save();
    await me.save();
    res.send({ followersUpdated: true });
  } catch (e) {
    res.send({ followersUpdated: false });
    console.log(e);
  }
});

module.exports = router;
