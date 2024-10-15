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

const sucessOrderRuntime = async (req, res) => {
  try {
    console.log(req.body);
    const {
      addressName,
      addressAddress,
      addressZip,
      addressState,
      addressCity,
      addressPhone,
      paymentMethod,
    } = req.body;

    console.log("Processing order");
    const email = req.session.user;

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const userId = user._id;
    const cart = await Cart.findOne({ User: userId })
      .populate("items.Product")
      .populate("couponid");

    if (!cart) {
      return res.status(400).send("Cart not found");
    }

    const products = cart.items.map((item) => ({
      product: item.Product._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price,
    }));
    

    // Check stock availability
    for (let item of cart.items) {
      const product = await Product.findById(item.Product._id);
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Update stock
    for (let item of cart.items) {
      const product = await Product.findById(item.Product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    const totalAmount = cart.totalPrice;

    // const coupon = await Coupon.find({ id : cart.couponid });
    if (paymentMethod === "Cash-on-Delivery" && totalAmount > 1000) {
      return res.status(400).json({
        message:
          "Orders above ₹1000 cannot be paid by Cash on Delivery. Please choose another payment method.",
      });
    }
    // Map numeric payment method to string value

    const newOrder = new Order({
      user: userId,
      products,
      address: {
        name: addressName,
        phone: addressPhone,
        address: addressAddress,
        state: addressState,
        city: addressCity,
        zip: addressZip,
      },

      paymentInfo: {
        method: paymentMethod,
        status: "Completed",
      },
      discountPercent: cart.couponid?.discountPercentage ?? 0,

      totalAmount: cart.totalPrice,
      status: "Pending",
    });

    if (paymentMethod === "Wallet") {
      user.wallet.balance -= newOrder.totalAmount;
      user.wallet.transactions.push({
        amount: newOrder.totalAmount,
        date: new Date(),
        type: "Debit",
        description: "Item Purchased",
      });
      await user.save();
    }

    await newOrder.save();

    cart.items = [];
    cart.couponid = null;
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const ordersucess = async (req, res) => {
  res.render("user/ordersucess");
};

const userorderdetail = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const userId = user._id;
    console.log(userId, "test111111111");

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: userId });
    const orders = await Order.find({ user: userId })

      .sort({ createdAt: -1 })
      .populate("products.product")
      .skip(startIndex)
      .limit(limit);

    res.render("user/userorderdetail", {
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    res.status(404).send("Order not found");
    console.error(error, "Order not found");
  }
};

const cancelorder = async (req, res) => {
  try {
    const orderId = req.params._id;
    const proId = req.params.proid;

    const { Reason, status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const productInOrder = order.products.find(
      (item) => item._id.toString() === proId
    );

    if (!productInOrder) {
      return res.status(404).json({ error: "Product not found in order" });
    }

    let product = await Product.findById(productInOrder.product);

    // Restore the stockkkkkkkkkkkkkk

    if (product) {
      product.stock += productInOrder.quantity;
      await product.save();
    }

    productInOrder.orderStatus = status == "cancel" ? "Cancelled" : "Returned";
    productInOrder.reason = Reason;
    await order.save();

    let totalAmount =
      productInOrder.totalPrice -
      (productInOrder.totalPrice * order.discountPercent) / 100;
    // for (let item of order.products) {
    //   totalAmount += item.quantity * item.price;
    // }
    // console.log(totalAmount,'helloo2222222');

    const user = await User.findById(order.user);

    if (!user) {
      return res.status(404).send("user not found");
    }

    if (status == "cancel") {
      if (
        order.paymentInfo.method === "Razorpay" ||
        order.paymentInfo.method === "Wallet"
      ) {
        user.wallet.balance += totalAmount;
        user.wallet.transactions.push({
          amount: totalAmount,
          description: "Refund for cancelled order",
          date: new Date(),
        });
      }
    } else {
      user.wallet.balance += totalAmount;
      user.wallet.transactions.push({
        amount: totalAmount,
        description: "Refund for returned order",
        date: new Date(),
      });
    }

    await user.save();

    await order.save();

    res.redirect(
      "/userorderdetail?successMessage=Order cancelled successfully"
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createOrder = async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const orderDetailsPage = async (req, res) => {
  const { id, proId } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    const item = await Product.findById(proId);
    console.log(item, "3333333333");
    if (!item) {
      return res.status(404).send({ message: "Product not found" });
    }

    // console.log(item.order, "podaaaaaa");

    res.render("user/orderDetailsPage", { item, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const wallet = async (req, res) => {
  const userEmail = req.session.user;
  const user = await User.findOne({ email: userEmail });
  if (!user) return res.redirect("/login");
 
  try {
      // Check transactions data
      console.log("Transactions:", user.wallet.transactions);

      // Sort transactions by date in descending order
      const latestTransactions = [...user.wallet.transactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
  
        // Debugging
        console.log("a.date:", dateA, "b.date:", dateB);
  
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
  
        return dateB - dateA;
      });
  
      // Debugging
      console.log("Sorted Transactions:", latestTransactions);
  
      const orderIds = latestTransactions.map(transaction => transaction.orderId);
    const orders = await Order.find({ _id: { $in: orderIds } });

    // Pass the sorted transactions to the view
    res.render("user/wallet.ejs", { user,latestTransactions,orders });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const paymentFailure = async (req, res) => {
  console.log("heloo111111111");
  try {
    console.log(req.body);
    const {
      addressName,
      addressAddress,
      addressZip,
      addressState,
      addressCity,
      addressPhone,
      paymentMethod,
    } = req.body;

    console.log("Processing order");
    const email = req.session.user;

    const user = await User.findOne({ email });
    console.log("heloo2222222");
    if (!user) {
      console.log("heloo3333");
      return res.status(404).send("User not found");
    }
    console.log("heloo55555");
    const userId = user._id;
    const cart = await Cart.findOne({ User: userId })
      .populate("items.Product")
      .populate("couponid");

    if (!cart) {
      return res.status(400).send("Cart not found");
    }

    const products = cart.items.map((item) => ({
      product: item.Product._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price,
    }));

    // Check stock availability
    for (let item of cart.items) {
      const product = await Product.findById(item.Product._id);
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    // Update stock
    // for (let item of cart.items) {
    //   const product = await Product.findById(item.Product._id);
    //   product.stock -= item.quantity;
    //   await product.save();
    // }

    const totalAmount = cart.totalPrice;

    // const coupon = await Coupon.find({ id : cart.couponid });
    if (paymentMethod === "Cash-on-Delivery" && totalAmount > 1000) {
      return res.status(400).json({
        message:
          "Orders above ₹1000 cannot be paid by Cash on Delivery. Please choose another payment method.",
      });
    }
    

    const newOrder = new Order({
      user: userId,
      products,
      address: {
        name: addressName,
        phone: addressPhone,
        address: addressAddress,
        state: addressState,
        city: addressCity,
        zip: addressZip,
      },

      paymentInfo: {
        method: paymentMethod,
        status: "Failed",
      },
      discountPercent: cart.couponid?.discountPercentage ?? 0,

      totalAmount: cart.totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    cart.items = [];
    cart.couponid = null;
    cart.totalPrice = 0;
    await cart.save();
    console.log("heloo7");
    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log("heloo888");
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const paymentFailedPage = async (req, res) => {
  try {
    res.render("user/paymentFailedPage");
  } catch (error) {
    console.error("Error rendering payment failed page:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const paymentRetry = async (req, res) => {
  const orderId = req.body.orderId;

  try {

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentInfo.status = "Completed";

    // Update stockkkk
    for (let item of order.products) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

   
    const updatedOrder = await order.save();


    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order payment status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const walletPayMent = async (req, res) => {
  console.log("hello");
};

const returnOrder = async (req, res) => {
  console.log("hellooo");
};

module.exports = {
  ordersucess,
  sucessOrderRuntime,
  userorderdetail,
  cancelorder,
  createOrder,
  orderDetailsPage,
  returnOrder,
  wallet,
  walletPayMent,
  paymentFailure,
  paymentFailedPage,
  paymentRetry,
};
