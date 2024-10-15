// tjis sokfsdkflsdkf;lsdfl;
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



const usercheckout = async (req, res) => {
  try {
    const userEmail = req.session.user;
    const user = await User.findOne({ email: userEmail });

    console.log(user, "User details retrieved");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const cartData = await Cart.findOne({ User: user._id }).populate({
      path: "items.Product", 
      model: "Product",
    });

    console.log(cartData, "Cart detailssssssssss");

    if (!cartData) {
      return res.status(404).send("Cart items not found");
    }


    let overallTotalPrice = 0;
    cartData.items.forEach((item) => {
      item.totalPrice = item.Product.price * item.quantity;
      overallTotalPrice += item.totalPrice;
    });
    const coupon = await Coupon.find({});
    // console.log(coupon);
    return res.render("user/usercheckout", {
      addresses: user.address,
      cart: cartData.items,
      walletAmount: user.wallet.balance,
      coupon: coupon,

      overallTotalPrice: overallTotalPrice,
    });
  } catch (error) {
    console.error("Error retrieving user checkout details:", error);
    res.status(500).send("Internal Server Error");
  }
};
const userCheckoutPost = async (req, res) => {
  try {
    const email = req.session.user;
    
    const userAddres = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip,
    };
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { $push: { address: userAddres } },
      { new: true }
    );
    if (!user) {
      return res.status(404).send("user not found");
    }
    return res.redirect("/usercheckout");
    // const cartData = await Cart.findOne({ User: user._id }).populate({
    //   path: "items.Product",
    //   model: "Product",
    // });

    // if (!cartData) {
    //   return res.status(404).send("Cart items not found");
    // }

    // // Calculate total price for each item and overall total price
    // // let overallTotalPrice = 0;
    // // cartData.items.forEach((item) => {
    // //   item.totalPrice = item.Product.price * item.quantity;
    // //   overallTotalPrice += item.totalPrice;
    // // });

    // return res.render("user/usercheckout", {
    //   addresses: user.address,
    //   cart: cartData.items,
    //   overallTotalPrice: overallTotalPrice,
    // });
  } catch (error) {
    console.error("Error retrieving user checkout details:", error);
    res.status(500).send("Internal Server Error");
  }
};
const incDecPost = async (req, res) => {
  const { productId } = req.params;
  const { newQuantity } = req.body;

  const email = req.session.user;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const userId = user._id;
    const cart = await Cart.findOne({ User: userId }).populate("items.Product");

    if (cart) {
      const item = cart.items.find(
        (item) => item.Product._id.toString() === productId
      );
      if (item) {
        // Checkkkk stock
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        if (newQuantity > product.stock) {
          return res
            .status(400)
            .json({ message: "Quantity exceeds available stock" });
        }

        item.quantity = newQuantity;
        await cart.save();

        let subtotal = 0;
        cart.items.forEach((item) => {
          subtotal += item.quantity * item.price;
        });

        cart.totalPrice = subtotal;
        await cart.save();

        res.json({
          message: "Quantity updated successfully",
          subtotal,
          totalPrice: cart.totalPrice,
        });
      } else {
        res.status(404).json({ message: "Item not found in cart" });
      }
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getwishlist = async (req, res) => {
  try {
    const useremail = req.session.user;
    const user = await User.findOne({ email: useremail });
    if (!user) return res.redirect("/login");

    const userId = user._id;
    const userWishlist = await Wishlist.findOne({ userId }).populate(
      "items.productId"
    );
    res.render("user/Wishlist", { wishlist: userWishlist, useremail });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).send("Internal Server Error");
  }
};
const isInWishlist = async (req, res) => {
  try {
    const useremail = req.session.user;
    const user = await User.findOne({ email: useremail });
    if (!user) return res.redirect("/login");

    const userId = user._id;
    const productId = req.params.id;

    const existingWishlist = await Wishlist.findOne({
      userId,
      "items.productId": productId,
    });

    res.json({ isInWishlist: !!existingWishlist });
  } catch (error) {
    console.error("Error checking if product is in wishlist:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addwishlist = async (req, res) => {
  try {
    const useremail = req.session.user;
    if (!useremail) {
      console.log("User not logged in");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email: useremail });
    console.log(user,'helloo user')
    if (!user) {
      console.log("User not found");
      return res.redirect("/login");
    }

    const userId = user._id; // Ensure correct field is used
    const productId = req.params.id;

    // console.log(userId,'yuyu66666')
    // console.log( productId ,'yuyu66666')

    // Ensure productId is valid
    if (!productId || productId === "undefined") {
      console.log("Invalid productId");
      return res.status(400).send("Invalid productId");
    }

    const product = await Product.findOne({ _id: productId });
    
    if (!product) {
      console.log("Product not found with id:", productId);
      return res.status(404).send("Product not found");
    }
    console.log('helloooo222222')
    let wishlist = await Wishlist.findOne({userId});
    console.log(wishlist,'kel')
    if (wishlist) {
      const isInWishlist = wishlist.items.some(
        (item) => item.productId.toString() === productId
      );
      if (isInWishlist) {
        console.log("Product already in wishlist");
        return res.redirect("/getwishlist");
      } else {
        wishlist.items.push({ productId });
        await wishlist.save();
        console.log("Product added to existing wishlist");
      }
    } else {
      await Wishlist.create({
        userId, // Ensure the correct user ID field is used
        items: [{ productId }],
      });
      console.log("New wishlist created and product added");
    }

    return res.redirect("/getwishlist");
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(500).send("Internal Server Error");
  }
};


const removefromwishlist = async (req, res) => {
  try {
    const useremail = req.session.user;
    const user = await User.findOne({ email: useremail });
    if (!user) return res.redirect("/login");

    const userId = user._id;
    const productId = req.params.id;

    console.log("Removing product", productId, "from wishlist of user", userId);

    const updateResult = await Wishlist.updateOne(
      { userId },
      { $pull: { items: { productId: productId } } }
    );
    console.log("Update result:", updateResult);

    return res.redirect("/getwishlist");
  } catch (err) {
    console.error("Error removing product from wishlist:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  

  incDecPost,
  usercheckout,
  userCheckoutPost,

  getwishlist,
  addwishlist,
  removefromwishlist,
};
