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

const addtocart = async (req, res) => {
  if (req.session.user) {
    try {
      const email = req.session.user;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).send("User not found");
      }

      const userId = user._id;
      console.log(userId,'userId222222')
      const productId = req.params.id;
      console.log(productId,'productId11111')

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send("Product not found");
      }

      let cart = await Cart.findOne({ User: userId });

      console.log("CART", cart);

      if (!cart) {
        cart = new Cart({
          User: userId,
          items: [],
        });
      }

      const existingItem = cart.items.find((item) =>
        item.Product.equals(productId)
      );
      if (existingItem) {
        if (product.stock < existingItem.quantity + 1) {
          return res.render("user/landPctDls", {
            product,
            message: "Insufficient Stock",
          });
        }

        existingItem.quantity += 1;
      } else {
        cart.items.push({
          image: product.image,
          Product: product._id,
          Productname: product.name,
          price: product.price,
          quantity: 1,
        });
      }

      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await cart.save();

      return res.redirect("/usercart");
    } catch (error) {
      console.log(error, "add to cart error");
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.redirect("/login");
  }
};

const usercart = async (req, res) => {
  if (req.session.user) {
    try {
      const userEmail = req.session.user;
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }

      const userId = user._id;

      const userCart = await Cart.findOne({ User: userId }).populate({
        path: "items.Product",
        model: "Product",
      });

      userCart.couponid = null;

      userCart.save();

      console.log(userCart, "test1");

      if (!userCart || userCart.items.length === 0) {
        return res.render("user/usercart", { userCart: null });
      } else {
        return res.render("user/usercart", { userCart });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.redirect("/login");
  }
};

const deleteCart = async (req, res) => {
  try {
    const email = req.session.user;
    const productId = req.params._id;
    const data = await User.findOne({ email });
    console.log(productId, "hellooooooooooooooooooooo");

    const user = await Cart.findOneAndUpdate(
      { User: data._id },
      { $pull: { items: { Product: productId } } },
      { new: true }
    );
    console.log(user, "0000000000000000000000");
    if (!user) {
      return res.status(404).send("user not found");
    }
    // Recalculate the total amount
    const totalAmount = user.items.reduce((acc, item) => {
      return acc + item.quantity * item.price;
    }, 0);

    // Update the cart with the new total amount
    user.totalPrice = totalAmount;
    await user.save();

    return res.redirect("/usercart");
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  usercart,
  addtocart,
  deleteCart,
};
