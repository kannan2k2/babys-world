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

const softdeletecategory = async (req, res) => {
  const id = req.params.id;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send("Category not found");
    }

    const isListed = category.isListed;
    await Category.updateOne({ _id: id }, { $set: { isListed: !isListed } });

    return res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send("Error deleting category");
  }
};

const editaddcategory = async (req, res) => {
  const id = req.params.id;
  let msg = null;
  try {
    const category = await Category.findOne({ _id: id });
    res.render("admin/editaddcategory", { category, msg });
  } catch (error) {
    console.log("error fetching product:", error);
    res.status(500).send("error fetching product");
  }
};

const editcategorypost = async (req, res) => {
  const id = req.params.id;
  const { name, discountoffer } = req.body;
  const category = await Category.findOne({ _id: id });

  try {
    // Check if the new category name is unique
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id }, // Ensure that the current category is excluded from the check
    });

    if (existingCategory) {
      return res.render("admin/editaddcategory", {
        category,
        msg: "Category name already exists",
      });
    }

    // Update the category if the name is unique
    const editcategory = await Category.findByIdAndUpdate(
      id,
      { name, discountoffer },
      { new: true }
    );

    if (!editcategory) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Error updating category. Please try again later.");
  }
};

const categorymanagement = async (req, res) => {
  try {
    const category = await Category.find({});

    for (const cat of category) {
      if (cat.discountoffer !== undefined) {
        const offerPercentage =
          cat.discountoffer !== 0 ? cat.discountoffer / 100 : 0;

        const products = await Product.find({ category: cat.id });

        for (const prod of products) {
          prod.price = Math.floor(prod.price)
          prod.price = Math.floor(prod.Mrp - prod.Mrp * offerPercentage);
          await prod.save();
        }

        await cat.save();
      }
    }

    res.render("admin/categorymanagement", { category });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Error fetching categories. Please try again later.");
  }
};

const addcategory = async (req, res) => {
  res.render("admin/addcategory");
};

const addcategorypost = async (req, res) => {
  const categoryName = {
    name: req.body.name.trim(),
    discountoffer: req.body.discountoffer.trim(),
  };

  try {
    // Use a case-insensitive regular expression to find an existing category
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.name}$`, "i") },
    });

    if (existingCategory) {
      return res.redirect("/admin/categorymanagement?exists=true");
    } else {
      const newCategory = new Category({
        name: categoryName.name,
        discountoffer: categoryName.discountoffer,
      });
      await newCategory.save();
      return res.redirect("/admin/categorymanagement");
    }
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send("Error adding category. Please try again later."); // Handle error response
  }
};

module.exports = {
  categorymanagement,
  addcategory,
  addcategorypost,
  softdeletecategory,
  editaddcategory,
  editcategorypost,
};
