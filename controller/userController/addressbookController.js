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

const addressbook = async (req, res) => {
  const email = req.session.user;

  try {
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.render("user/addressbook", { data: user.address });
    }
  } catch (error) {
    console.error("Error retrieving account details:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addressbookpost = async (req, res) => {
  try {
    console.log("Email from session:", req.session.user);
    

    const newAddress = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip,
    };

    const user = await User.findOneAndUpdate(
      { email: req.session.user },
      { $push: { address: newAddress } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.render("user/addressbook", { data: user.address });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

const editaddress = async (req, res) => {
  const id = req.params._id;

  // console.log(id);

  try {
    const data = await User.findOne({ email: req.session.user });

    const address = data.address.filter((element) => {
      return element._id == id;
    });
    let [addressobj] = address;
    // console.log(addressobj);

    return res.render("user/editaddress", { addressobj });
  } catch (error) {
    console.log("error fetching product:", error);
    res.status(500).send("error fetching product");
  }
};

const deleteaddress = async (req, res) => {
  const userId = req.session.user; // Assuming session user contains the user ID
  const addressId = req.params.id;

  try {
    const user = await User.findOneAndUpdate(
      { email: userId },
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.redirect("/addressbook"); // Adjust the redirection path as necessary
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).send("Internal Server Error");
  }
};

const userEditAddressPost = async (req, res) => {
  const { first_name, last_name } = req.body;
  const email = req.session.user;
  try {
    const data = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          firstname: first_name,
          lastname: last_name,
        },
      },
      { new: true }
    );
    if (!data) {
      return res.status(404).send("user not found");
    } else {
      return res.render("user/userprofile", { user: data });
    }
  } catch (error) {
    console.error(error, "user not found");
  }
};
// ----------------------------------------------------------------------------

const editaddresspost = async (req, res) => {
  const { name, phone, address, state, city, zip, _id } = req.body;

  try {
    const data = await User.findOneAndUpdate(
      { "address._id": _id },

      {
        $set: {
          "address.$.name": name,
          "address.$.phone": phone,
          "address.$.address": address,
          "address.$.state": state,
          "address.$.city": city,
          "address.$.zip": zip,
        },
      },
      { new: true }
    );

    if (!data) {
      return res.render("user/editaddress", { error: "Address not found" });
    }

    return res.redirect("/addressbook");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating");
  }
};

module.exports = {
  addressbook,
  addressbookpost,
  userEditAddressPost,
  editaddress,
  deleteaddress,
  editaddresspost,
};
