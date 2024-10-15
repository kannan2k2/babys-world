const User = require("../../model/user");
const { Order } = require("../../model/order");
const mongoose = require("mongoose");
const Product = require("../../model/productmanagement");
const Category = require("../../model/category");
const Coupon = require("../../model/coupon");
const session = require("express-session");
const { request } = require("express");
const path = require("path");
const { findOne } = require("../../model/otp");
const exceljs = require("exceljs");
const { error } = require("console");

const login = (req, res) => {
  try {
    if (req.session.email) {
      return res.redirect("/admin/dashboard");
    } else {
      return res.render("admin/adminlogin");
    }
  } catch (error) {
    console.log("error", error);
  }
};
const loginpost = (req, res) => {
  const email = "admin@123";
  const password = "123";
  if (email == req.body.email && password == req.body.password) {
    req.session.email = email;
    return res.redirect("/admin/dashboard");
  } else {
    return res.render("admin/login");
  }
};

module.exports = {
  login,
  loginpost,
};
