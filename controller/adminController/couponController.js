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

const couponsmanagement = async (req, res) => {
  const coupons = await Coupon.find({});

  // Render the coupon management page with coupons
  return res.render("admin/couponsmanagement", { coupons });
};

const addCouponPost = async (req, res) => {
  const { couponCode, discountPercentage, expiryDate, status } = req.body;

  try {
    // Check if the coupon already exists
    const existingCoupon = await Coupon.findOne({
      couponCode: { $regex: new RegExp(`^${couponCode}$`, "i") },
    });

    // If a coupon with the same code (case-insensitive) exists, send an error response
    if (existingCoupon) {
      return res
        .status(400)
        .json({ error: "Coupon with this code already exists" });
    }
    // Create a new coupon instance
    const newCoupon = new Coupon({
      couponCode,
      discountPercentage,
      expiryDate,
      status,
    });

    // Save the coupon to the database
    await newCoupon.save();

    // Respond with success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving coupon:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const softDeleteCoupon = async (req, res) => {
  const id = req.params.id;

  try {
    const coupon = await Coupon.findById(id);

    if (coupon) {
      const newCouponStatus =
        coupon.status === "active" ? "inactive" : "active";

      await Coupon.updateOne(
        { _id: id },
        { $set: { status: newCouponStatus } }
      );

      return res.redirect("/admin/couponsmanagement");
    } else {
      console.error("Coupon not found");
      return res.status(404).send("Coupon not found");
    }
  } catch (error) {
    console.error("Error updating coupon status", error);
    return res.status(500).send("Internal server error");
  }
};

const deleteCoupon = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Coupon.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).send("Coupon not found");
    }

    return res.redirect("/admin/couponsmanagement");
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).send("An error occurred while deleting the coupon");
  }
};

const addcoupens = async (req, res) => {
  res.render("admin/addcoupens");
};

module.exports = {
  addCouponPost,
  addcoupens,
  deleteCoupon,
  softDeleteCoupon,
  couponsmanagement,
};
