const mongoose = require("mongoose");
const validator = require("validator");
// const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Name is required"],
  },
  username: {
    type: String,
    // validate: {
    //   validator: async function (username) {
    //     const count = await mongoose.models.User.countDocuments({
    //       username,
    //     });
    //     return !count;
    //   },
    //   message: "Username already exists",
    // },
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Email is not valid");
      }
    },
    // validate: {
    //   validator: async function (email) {
    //     const emailCount = await mongoose.models.User.countDocuments({
    //       email,
    //     });
    //     return !emailCount;
    //   },
    //   message: "Email already exists",
    // },
    required: [true, "Email is required"],
  },
  phone: {
    type: String,
    minLength: [10, "Phone number is not valid"],
    maxLength: [10, "Phone number is not valid"],
    required: [true, "Phone number is required"],
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  follower: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    minLength: [5, "Password should be of minimum 5 characters"],
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  streams: [
    {
      stream: {
        title: {
          type: String,
          required: [true, "Title is required"],
        },
        by: {
          type: String,
        },
        amount: {
          type: Number,
          min: [30, "Minimum 10Rs amount is required"],
          max: [500, "Maximum 500Rs amount is possible"],
        },
        description: {
          type: String,
          required: [true, "Description is required"],
        },
        meetingId: {
          type: String,
        },
        roomName: {
          type: String,
        },
        link: {
          type: String,
        },
        thumbnail: {
          data: Buffer,
          contentType: String,
        },
        category: {
          type: String,
          required: [true, "Category is required"],
        },
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },
      `${process.env.JWT_KEY}`
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (e) {
    console.log(e);
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next(); // next is necessary to call to continue further code
  }
});

// userSchema.plugin(uniqueValidator, { message: "{PATH} already exists" });

const User = new mongoose.model("User", userSchema);

module.exports = User;
