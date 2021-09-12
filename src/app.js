require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");
const port = process.env.PORT || 80;
const User = require("./models/user.js");
const fs = require("fs");
const auth = require("./middleware/auth");
const upload = require("./middleware/upload");

const orgId = process.env.DYTE_ORG_ID;
const apiKey = process.env.DYTE_API_KEY;
const baseURL = process.env.DYTE_API_BASE_URL;

const staticPath = path.join(__dirname, "../public");
require("./db/conn.js");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(staticPath));

app.set("view engine", "ejs");

app.use("/signup", require("./routes/signup"));
app.use("/login", require("./routes/login"));
app.use("/", require("./routes/meeting"));
app.use("/profile", require("./routes/profile"));

app.get("/home", (req, res) => {
  res.render("landing");
});

app.get("/beforeLive/:id", auth, async (req, res) => {
  const resp = await axios.post(
    `${baseURL}/v1/organizations/${orgId}/meeting`,
    {
      title: "New test meeting",
    },
    {
      headers: {
        Authorization: `APIKEY ${apiKey}`,
      },
    }
  );

  const meeting = resp.data.data.meeting;
  const roomName = meeting.roomName;
  const meetingId = meeting.id;

  res.render("beforeLive", {
    id: req.params.id,
    meetingId: meetingId,
    roomName: roomName,
  });
});

app.post(
  "/liveInfo/:id",
  auth,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      const username = user.username;
      const srcStart = req.body.paymentButton.indexOf(`https`);
      const srcEnd = req.body.paymentButton.indexOf(
        `" data-payment_button_id="`
      );
      const paymentIdStart = req.body.paymentButton.indexOf(`"pl_`);
      const paymentIdEnd = req.body.paymentButton.indexOf(`" async`);
      const src = req.body.paymentButton.slice(srcStart, srcEnd);
      const paymentId = req.body.paymentButton.slice(
        paymentIdStart + 1,
        paymentIdEnd
      );

      const newLive = {
        title: req.body.title,
        by: username,
        description: req.body.description,
        thumbnail: {
          data: fs.readFileSync(
            path.join(__dirname, "temp", req.file.filename)
          ),
          contentType: "image/png",
        },
        src: src,
        paymentId: paymentId,
        amount: req.body.amount,
        category: req.body.category,
      };

      user.streams = user.streams.concat({ stream: newLive });

      await user.save();

      fs.renameSync(
        path.join(__dirname, "temp", req.file.filename),
        path.join(__dirname, "uploads/thumbnails", req.file.filename)
      );

      res.redirect(
        `../host/${req.params.id}?meetingId=${req.query.meetingId}&roomName=${req.query.roomName}`
      );
    } catch (e) {
      fs.unlinkSync(path.join(__dirname, "temp", req.file.filename));
      res.send(e);
    }
  }
);

app.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    req.user.tokens = req.user.tokens.filter((el) => el.token !== req.token);
    await req.user.save();
    res.redirect("login");
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/index/:id", auth, async (req, res) => {
  const allUsers = await User.find();
  const allStreams = allUsers.map((user) => user.streams);
  let entertainmentStreams = [],
    educationStreams = [],
    gamingStreams = [],
    travelStreams = [];
  allStreams.forEach((streamArray) => {
    const entertainments = streamArray.filter(
      (item) => item.stream.category === "Entertainment"
    );
    entertainmentStreams = [...entertainmentStreams, ...entertainments];
    const educations = streamArray.filter(
      (item) => item.stream.category === "Education"
    );
    educationStreams = [...educationStreams, ...educations];

    const travels = streamArray.filter(
      (item) => item.stream.category === "Travel"
    );
    travelStreams = [...travelStreams, ...travels];

    const gamings = streamArray.filter(
      (item) => item.stream.category === "Gaming"
    );
    gamingStreams = [...gamingStreams, ...gamings];
  });

  res.render("index", {
    id: req.params.id,
    entertainmentStreams,
    educationStreams,
    travelStreams,
    gamingStreams,
  });
});

app.get("/join/:id", auth, async (req, res) => {
  try {
    const allUsers = await User.find();
    const allStreams = allUsers.map((user) => user.streams);
    let requiredStream;
    allStreams.forEach((streamArray) => {
      if (requiredStream) {
        return;
      }
      requiredStream = streamArray.find((item) => {
        return item._id == req.params.id;
      });
    });
    res.render("join", {
      stream: requiredStream,
    });
  } catch (e) {
    res.status(501).send(e);
  }
});

app.post("/search", auth, async (req, res) => {
  try {
    const matchedUser = await User.findOne({ username: req.body.value });
    if (matchedUser) {
      const id = matchedUser._id;
      res.redirect(`/profile/${id}`);
    } else {
      throw new Error();
    }
  } catch (e) {
    res.render("noUserFound", {
      id: req.user.id,
    });
  }
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
