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

const productmanagement = async (req, res) => {
  const products = await Product.find({}).populate("category").exec();
  // console.log(products)
  res.render("admin/productmanagement", { products });
};

const addproduct = async (req, res) => {
  try {
    const product = await Product.find({});
    const category = await Category.find({});
    const products = await Product.find({}).populate("category").exec();
    res.render("admin/addproduct", { category, products });
  } catch (error) {
    console.log("error fetching category");
    res.status(500).send("Error fetching categries");
  }
};

const editaddproduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findOne({ _id: id });
    const category = await Category.find({});

    return res.render("admin/editaddproduct", { product, category });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Error fetching product");
  }
};

const editproductpost = async (req, res) => {
  const { ProductName, Mrp, price, description, category, stock, _id } =
    req.body;
  const image = req.files.map((file) => file.filename);

  try {
    const editproduct = await Product.findOneAndUpdate(
      { _id: _id },
      {
        ProductName: ProductName,
        Mrp: Mrp,
        price: price,
        description: description,
        category: category,
        stock: stock,
        $push: {
          image: { $each: image },
        },
      }
    );
    if (!editproduct) {
      return res.render("editaddproduct", { message: "User is found" });
    }
    return res.redirect("/admin/productmanagement");
  } catch (error) {
    console.error("error updating user:", error);
    res.status(500).send("error updating user");
  }
};

const softdeleteproduct = async (req, res) => {
  const id = req.params.id;

  try {
    const softdeleteuser = await Product.findById({ _id: id });

    if (softdeleteuser.isListed) {
      const product = await Product.findById(id);

      if (product) {
        const newIsListedValue = !product.isListed;
        const updateResult = await Product.updateOne(
          { _id: id },
          { $set: { isListed: newIsListedValue } }
        );
      } else {
        console.log("Product not found");
      }

      return res.redirect("/admin/productmanagement");
    } else {
      const result = await Product.updateOne(
        { _id: id },
        { $set: { isListed: true } }
      );
      return res.redirect("/admin/productmanagement");
    }
  } catch (error) {
    console.error("Error deleteing product", error);
    return res.status(500);
  }
};

const productpost = async (req, res) => {
  // console.log(req.files);
  const { ProductName, Mrp, description, stock, category } = req.body;
  const image = req.files.map((file) => file.filename);
  const price=Mrp
  try {
    const newProduct = new Product({
      ProductName,
      Mrp,
      price,
      stock,
      category,
      description,
      image,
    });
    await newProduct.save();
    const products = await Product.find({}).populate("category").exec();

    res.render("admin/productmanagement", { products, category });
  } catch (error) {
    res.status(500).send("internal sever error");
    console.error(error);
  }
};

module.exports = {
  productmanagement,
  addproduct,
  productpost,
  editaddproduct,
  editproductpost,
  softdeleteproduct,
};
