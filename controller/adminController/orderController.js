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

const OrderDetailsPage = async (req, res) => {
  const id = req.params._id;
  const proId = req.params.proId;

  try {
    // Find the order by ID
    const order = await Order.findById(id).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the product by ID
    const item = await Product.findById(proId);
    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(item, order, "ffffffffff");

    // Render the admin order details page
    res.render("admin/orderDetailsPage", { item, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const ordermanagement = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products.product")
      .populate({ path: "user" })
      .exec();
    console.log(orders, "new");

    res.render("admin/ordermanagement", { orders });
  } catch (error) {
    console.error("error updating user:", error);
  }
};

const updatestatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { newStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const itemToUpdate = order.products.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToUpdate) {
      return res.status(404).json({ error: "Item not found in the order" });
    }

    itemToUpdate.orderStatus = newStatus;

    await order.save();

    res.json({ message: "Item status updated successfully" });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  OrderDetailsPage,
  ordermanagement,
  updatestatus,
};
