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

// router.patch("/:id/follow", auth, async (req, res) => {
//   try {
//     // const userFollow = await User.findOne({ _id: req.body.otherid });
//     // const userFollowing = await User.findOne({ _id: req.body.myid });
//     // userFollow.follower++;
//     // userFollowing.following++;
//     // await userFollow.save();
//     // await userFollowing.save();
//     await User.findOneAndUpdate(
//       { _id: req.body.otherid },
//       { $inc: { follower: 1 } }
//     );
//     await User.findOneAndUpdate(
//       { _id: req.body.myid },
//       { $inc: { following: 1 } }
//     );
//     res.send({ followersUpdated: true });
//   } catch (e) {
//     res.send({ followersUpdated: false });
//     console.log(e);
//   }
// });

module.exports = router;
