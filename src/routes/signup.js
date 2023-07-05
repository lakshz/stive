const express = require("express");
const router = express.Router();
const User = require("../models/user");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/upload");

const errorFormatter = (e) => {
  let errors = {};
  const allErrors = e.substring(e.indexOf(":") + 1).trim();
  const allErrorsArray = allErrors.split(",").map((err) => err.trim());
  allErrorsArray.forEach((err) => {
    const [key, value] = err.split(":").map((error) => error.trim());
    errors[key] = value;
  });

  return errors;
};

const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "mail.contact.stive@gmail.com",
    pass: "stiveclub",
  },
});

router.get("/", (req, res) => {
  res.render("signup", {
    errors: null,
  });
});

router.post("/", upload.single("img"), async (req, res) => {
  try {
    const newUser = new User({
      fullname: req.body.name,
      username: req.body.username,
      email: req.body.email,
      img: {
        data: fs.readFileSync(
          path.join(__dirname, "../temp", req.file.filename)
        ),
        contentType: "image/png",
      },
      phone: req.body.phone,
      password: req.body.password,
    });

    const token = await newUser.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true, // cannot be changed
    });

    await newUser.save();

    fs.renameSync(
      path.join(__dirname, "../temp", req.file.filename),
      path.join(__dirname, "../uploads/profilePhotos", req.file.filename)
    );

    const mailOptions = {
      to: newUser.email,
      subject: "Hello from STIVE!",
      html: `
        <h2>Thank You ${newUser.fullname}, for registering on Stive.</h2>
      `,
    };

    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        res.send("Error in sending verification mail. Please try again later");
      } else {
        console.log("Message sent");
      }
    });
    res.render("success");
  } catch (e) {
    console.log(e);
    // res.send(e.message);
    fs.unlinkSync(path.join(__dirname, "../temp", req.file.filename));
    console.log(e.message);
    const error = {
      case: "Validation error",
      debugInfo: errorFormatter(e.message),
    };
    console.log(error);
    res.render("signup", {
      errors: {
        fullname: {
          isError: error.debugInfo.hasOwnProperty("fullname"),
          message: error.debugInfo.fullname || null,
        },
        username: {
          isError: error.debugInfo.hasOwnProperty("username"),
          message: error.debugInfo.username || null,
        },
        email: {
          isError: error.debugInfo.hasOwnProperty("email"),
          message: error.debugInfo.email || null,
        },
        phone: {
          isError: error.debugInfo.hasOwnProperty("phone"),
          message: error.debugInfo.phone || null,
        },
        password: {
          isError: error.debugInfo.hasOwnProperty("password"),
          message: error.debugInfo.password || null,
        },
      },
    });
  }
});

module.exports = router;
