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

const login = (req, res) => {
  if (req.session.user) {
    return res.redirect("/home");
  } else {
    return res.render("user/login", { message: "" });
  }
};

const sendemailer = (options) => {
  const transport = nodemailer.cratetransport({
    service: "Gmail",
    auth: {
      user: "",
      pass: "",
    },
  });
};

const loginpost = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  console.log(existingUser);

  if (existingUser) {
    if (existingUser.password == req.body.password) {
      req.session.user = req.body.email;
      return res.redirect("/home");
    }
  } else {
    return res.render("user/login", { message: "user is not found" });
  }
};

const signup = (req, res) => {
  res.render("user/signup");
};

const signupost = async (req, res) => {
  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    referalCode: req.body.referalcode,
  };
  req.session.signupdata = data;

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    return res.render("user/signup", { message: "User already exists" });
  } else {
    const otp = generateOTP();
    console.log(otp);
    const mailOptions = {
      from: "babysworldw@gmail.com",
      to: data.email,
      subject: "Your OTP Code",
      text:`Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error);
        res.render("user/signup", { message: "Error sending OTP" });
      } else {
        // Save OTP temporarily
        req.session.userdata = data;
        const otpData = new OTP({
          email: data.email,
          otp: otp,
          createdAt: new Date(),
        });
        await otpData.save();

        res.render("user/otp", { email: data.email });
      }
    });
  }
};

const otp = (req, res) => {
  res.render("user/otp");
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "babysworldw@gmail.com",
    pass: "hgoh fcme pwnn dpis",
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP verification
const otppost = async (req, res) => {
  const data = [
    req.body.otp1,
    req.body.otp2,
    req.body.otp3,
    req.body.otp4,
    req.body.otp5,
    req.body.otp6,
  ];

  const enteredOtp = data.join("");

  const { email } = req.session.userdata;

  try {
    const otpRecord = await OTP.findOne({ email: email });

    if (!otpRecord) {
      return res.render("user/otp", { message: "Invalid OTP" });
    } else {
      const currentTime = new Date();
      const otpCreationTime = new Date(otpRecord.createdAt);
      const timeDiff = (currentTime - otpCreationTime) / 1000;

      if (timeDiff > 600) {
        return res.render("user/otp", { message: "OTP expired" });
      } else if (otpRecord.otp !== enteredOtp) {
        return res.render("user/otp", { message: "Incorrect OTP" });
      } else {
        const newUser = new User({
          firstname: req.session.userdata.firstname,
          lastname: req.session.userdata.lastname,
          email: req.session.userdata.email,
          password: req.session.userdata.password,
          wallet: {
            balance: 0,
            transactions: [],
          },
        });

        if (req.session.signupdata.referalCode) { // Corrected line
       
          const referrer = await User.findOne({ referalCode: req.session.signupdata.referalCode }); // Corrected line

          if (referrer) {
            if (!referrer.wallet) {
              referrer.wallet = {
                balance: 0,
                transactions: []
              };
            }

            referrer.wallet.balance += 50;
            referrer.wallet.transactions.push({
              amount: 50,
              description: 'Referral bonus credited',
              date: new Date()
            });
            await referrer.save();

            if (!newUser.wallet) {
              newUser.wallet = {
                balance: 0,
                transactions: []
              };
            }

            newUser.wallet.balance += 100;
            newUser.wallet.transactions.push({
              amount: 100,
              description: 'Referral signup bonus credited',
              date: new Date()
            });
          }
        }

        await newUser.save();
        await OTP.deleteOne({ email: email });
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
};

const transporterr = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "babysworldw@gmail.com",
    pass: "hgoh fcme pwnn dpis",
  },
});

// Generate OTP function
const generateOTPP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "",
    pass: "",
  },
});

const userlogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("error destroing session");
    } else {
      return res.redirect("/login");
    }
  });
};

const resendOtp = async (req, res) => { 
  const { email } = req.session.userdata;

  const otp = generateOTP();
  console.log(otp);
  const mailOptions = {
    from: "babysworldw@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log(error);
      res.render("user/signup", { message: "Error sending OTP" });
    } else {
      await OTP.updateOne(
        { email: email },
        { otp: otp, createdAt: new Date() },
        { upsert: true }
      );
      // Save OTP temporarily
      // const otpData = new OTP({
      //   email:email,
      //   otp: otp,
      //   createdAt: new Date(),
      // });
      // await otpData.save();

      res.render("user/otp", { email: email });
    }
  });
};

const forgotpass = (req, res) => {
  res.render("user/forgotpass");
};



const forgotpost = async (req, res) => {
  const passdata = {
    email: req.body.email,
    newpassword: req.body.newPassword,
  };
  console.log(passdata);
  const existingUser = await User.findOne({ email: passdata.email });
  console.log( existingUser,'helloo11')

  if (!existingUser) {
    res.render("user/forgotpass", { message: "user not fount" });
  } else {
    const otp = generateOTP();
    console.log(otp,'helloo222');
    const mailOption = {
      from: "babysworldw@gmail.com",
      to: passdata.email,
      subject: "your OTP Code",
      text: `your OTP code is ${otp}`,
    };

   

    transporter.sendMail(mailOption, async (error, info) => {
      if (error) {
        res.render("user/forgotpass", { message: "error sending OTP" });
      } else {
        // save OTP temporarilyyyy
        req.session.passworddata = passdata;
        const otpData = new OTP({
          email: passdata.email,
          otp: otp,
          createdAt: new Date(),
        });
        await otpData.save();
        res.render("user/forgotOTP", { email: passdata.email });
      }
    });
  }
};
// OTP verificationnnnnn
const forgotOTPpost = async (req, res) => {
  const data = [
    req.body.otp1,
    req.body.otp2,
    req.body.otp3,
    req.body.otp4,
    req.body.otp5,
    req.body.otp6,
  ];
  console.log(data);
  const otpdata = data.join("");

  const { email, newpassword } = req.session.passworddata;

  try {
    const otpRecord = await OTP.findOne({ email: email });

    console.log(otpRecord);

    if (!otpRecord) {
      return res.render("user/forgotOTP", { message: "Invalid OTP" });
    } else {
      console.log(otpdata);
      console.log(otpRecord.otp);
      if (otpRecord.otp == otpdata) {
        // Check OTP expiration

        // const currentTime = new Date();
        // const otpCreationTime = new Date(otpRecord.createdAt);
        // const timediff = (currentTime - otpCreationTime) / 1000;

        // if (timediff > 600) {
        //   return res.render("user/otp", { message: "OTP expired" });
        // }
        // else {

        const updatedUser = await User.findOneAndUpdate(
          { email: email },
          { password: newpassword },
          { new: true }
        );
        await OTP.deleteOne({ email: email }), res.redirect("/login");
      } else {
        console.log("hellii");
        return res.render("user/forgotOTP", { message: "incorrect OTP" });
      }
    }
    // }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  signup,
  login,
  userlogout,
  signupost,
  loginpost,
  otppost,
  otp,
  sendemailer,
  resendOtp,
  forgotpass,
  forgotpost,
  forgotOTPpost,
};
