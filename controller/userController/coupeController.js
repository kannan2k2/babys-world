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
// const forgotPass=require('../model/forgotpass')

const applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  const userEmail = req.session.user;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartData = await Cart.findOne({ User: user._id });
    if (!cartData) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const coupon = await Coupon.findOne({ couponCode });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (coupon.status === "active") {
      if (cartData.totalPrice < 1000) {
        return res.status(400).json({
          message:
            "Total purchase amount must be at least 1000 to apply this coupon",
        });
      }

      const discountAmount =
        (coupon.discountPercentage / 100) * cartData.totalPrice;
      if (discountAmount < coupon.minDiscountAmount) {
        return res.status(400).json({
          message: `Minimum discount amount is ${coupon.minDiscountAmount}`,
        });
      }

      cartData.couponid = coupon.id;

      cartData.totalPrice -= Math.round(discountAmount);

      await cartData.save();

      return res.json({
        message: "Coupon applied successfully",
        discountAmount: Math.round(discountAmount), 
        cartData,
      });
    } else {
      return res.status(400).json({ message: "Coupon is inactive" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  applyCoupon,
};
