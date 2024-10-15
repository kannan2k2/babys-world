const mongoose = require("mongoose");
const verifyotp = require("../../model/otp");
const { Cart, CartItem } = require("../../model/cart");
const { Order } = require("../../model/order");
const Wishlist = require("../../model/wishlist");
const OTP = require("../../model/otp");
const User = require("../../model/user");
const Product = require("../../model/productmanagement");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();
const Razorpay = require("razorpay");
const { productmanagement } = require("../adminController/adminController");
const Coupon = require("../../model/coupon");
const Category = require("../../model/category");

const userprofile = async (req, res) => {
  const email = req.session.user;

  const user = await User.findOne({ email: email });
  res.render("user/userprofile", { user });
};

const userchangepass = async (req, res) => {
  res.render("user/userchangepass");
};

const userChangePassPost = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const email = req.session.user;
  console.log(email);

  try {
    if (newPassword !== confirmPassword) {
      return res
        .status(404)
        .send({ message: "New password and confirm password do not match" });
    }
    const userpass = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } },
      { new: true }
    );
    return res.render("user/userchangepass");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating");
  }
};

module.exports = {
  userchangepass,
  userChangePassPost,
  userprofile,
};
