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


const home = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/login");
    }
    console.log("okm");
    const productData = await Product.find();
    // console.log(productData);
    // const userdata = await User.findOne({ _id: user });
    return res.render("user/home", { productData: productData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const landPctDls = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findOne({ _id: id });
    let message = null;
    // console.log(product)
    if (product) {
      res.render("user/landPctDls", { product, message });
    } else {
      res.status(404).send("product not found");
    }
  } catch (err) {
    res.status(500).send("server error");
  }
};

const productsSortAndFilter = async (req, res) => {
  try {
    const { sortBy, filterBy } = req.query;

    let query = {};
    if (filterBy) {
      query = { category: filterBy };
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = 1;
    }

    const results = await Product.find(query).sort(sort).exec();
    res.render("productDisplay", { results });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const search = async (req, res) => {
  const qry = req.query.query || "";
  const filterBy = req.query.filterBy;
  const sortBy = req.query.sortBy;

  try {
   
    res.redirect(`/productlistPage?query=${qry}&filterBy=${filterBy || ""}&sortBy=${sortBy || ""}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


const searchpage = async (req, res) => {
  res.render("user/searchpage");
};

const landingpage = async (req, res) => {
  const productData = await Product.find();

  return res.render("user/home", { productData: productData });
};

const productlistPage = async (req, res) => {
  const qry = req.query.query || "";
  const filterBy = req.query.filterBy;
  const sortBy = req.query.sortBy;
  const page = parseInt(req.query.page) || 1; 
  const limit =5;
  const skip = (page - 1) * limit; 

  try {
    const categories = await Category.find();

    let queryObject = {
      $or: [
        { ProductName: { $regex: qry, $options: "i" } },
        { description: { $regex: qry, $options: "i" } },
      ],
    };

    if (filterBy) {
      queryObject.category = filterBy;
    }

    let sortObject = {};
    if (sortBy === "priceAsc") {
      sortObject.price = 1; 
    } else if (sortBy === "priceDesc") {
      sortObject.price = -1; 
    } else if (sortBy === "nameAsc") {
      sortObject.ProductName = 1; 
    } else if (sortBy === "nameDesc") {
      sortObject.ProductName = -1;
    }

    const totalProducts = await Product.countDocuments(queryObject);
    const productData = await Product.find(queryObject)
      .sort(sortObject)
      .limit(limit)
      .skip(skip);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.render("user/productlistPage", { 
      productData, 
      categories, 
      req, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  home,
  search,
  landPctDls,
  landingpage,
  searchpage,
  productlistPage,
  productsSortAndFilter,
};
