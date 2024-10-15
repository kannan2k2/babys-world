// const mongoose = require("mongoose");
// const verifyotp = require("../../model/otp");
// const { Cart, CartItem } = require("../../model/cart");
// const { Order } = require("../../model/order");
// const Wishlist = require("../../model/wishlist");
// const OTP = require("../../model/otp");
// const User = require("../../model/user");
// const Product = require("../../model/productmanagement");
// const session = require("express-session");
// const nodemailer = require("nodemailer");
// require("dotenv").config();
// const Razorpay = require("razorpay");
// const { productmanagement } = require("../adminController/adminController");
// const Coupon = require("../../model/coupon");
// const Category = require("../../model/category");

// const forgotpass = (req, res) => {
//   res.render("user/forgotpass");
// };
// const sendemailer = (options) => {
//   const transport = nodemailer.cratetransport({
//     service: "Gmail",
//     auth: {
//       user: "",
//       pass: "",
//     },
//   });
// };

// const generateOTP = () => {
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
//   return otp;
// };

// const forgotpost = async (req, res) => {
//   const passdata = {
//     email: req.body.email,
//     newpassword: req.body.newPassword,
//   };
//   console.log(passdata);
//   const existingUser = await User.findOne({ email: passdata.email });
//   console.log( existingUser,'helloo11')

//   if (!existingUser) {
//     res.render("user/forgotpass", { message: "user not fount" });
//   } else {
//     const otp = generateOTP();
//     console.log(otp,'helloo222');
//     const mailOption = {
//       from: "babysworldw@gmail.com",
//       to: passdata.email,
//       subject: "your OTP Code",
//       text: `your OTP code is ${otp}`,
//     };

   

//     transporter.sendMail(mailOption, async (error, info) => {
//       if (error) {
//         res.render("user/forgotpass", { message: "error sending OTP" });
//       } else {
//         // save OTP temporarilyyyy
//         req.session.passworddata = passdata;
//         const otpData = new OTP({
//           email: passdata.email,
//           otp: otp,
//           createdAt: new Date(),
//         });
//         await otpData.save();
//         res.render("user/forgotOTP", { email: passdata.email });
//       }
//     });
//   }
// };
// // OTP verificationnnnnn
// const forgotOTPpost = async (req, res) => {
//   const data = [
//     req.body.otp1,
//     req.body.otp2,
//     req.body.otp3,
//     req.body.otp4,
//     req.body.otp5,
//     req.body.otp6,
//   ];
//   console.log(data);
//   const otpdata = data.join("");

//   const { email, newpassword } = req.session.passworddata;

//   try {
//     const otpRecord = await OTP.findOne({ email: email });

//     console.log(otpRecord);

//     if (!otpRecord) {
//       return res.render("user/forgotOTP", { message: "Invalid OTP" });
//     } else {
//       console.log(otpdata);
//       console.log(otpRecord.otp);
//       if (otpRecord.otp == otpdata) {
//         // Check OTP expiration

//         // const currentTime = new Date();
//         // const otpCreationTime = new Date(otpRecord.createdAt);
//         // const timediff = (currentTime - otpCreationTime) / 1000;

//         // if (timediff > 600) {
//         //   return res.render("user/otp", { message: "OTP expired" });
//         // }
//         // else {

//         const updatedUser = await User.findOneAndUpdate(
//           { email: email },
//           { password: newpassword },
//           { new: true }
//         );
//         await OTP.deleteOne({ email: email }), res.redirect("/login");
//       } else {
//         console.log("hellii");
//         return res.render("user/forgotOTP", { message: "incorrect OTP" });
//       }
//     }
//     // }
//   } catch (error) {
//     console.error("Error during OTP verification:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// module.exports = {
//   forgotpass,
//   forgotpost,
//   forgotOTPpost,
// };
