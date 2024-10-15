const express = require("express");
const router = express.Router();
const passport = require("passport");
// const { blockCheck } = require("../middilwere/block");
const {isAuthicated} = require('../middilwere/session');

const cartcontroller=require("../controller/userController/cartController")
const orderController=require("../controller/userController/orderController")
const usercontroller = require("../controller/userController/userController");
const couponController=require('../controller/userController/coupeController')
const forgotController=require("../controller/userController/forgotController")
const loginallController=require('../controller/userController/loginallController')
const addressbookController=require("../controller/userController/addressbookController")
const homeallController=require('../controller/userController/homeallController')
const userprofileController=require('../controller/userController/userprofileController')






// Login page and signup

router.get("/login", loginallController.login);
router.post("/login",loginallController.loginpost);
router.get("/userlogout", loginallController.userlogout);
router.get("/sendemailer",loginallController.sendemailer);
router.get("/signup",loginallController.signup);
router.post("/signupost", loginallController.signupost);
router.get("/otp",loginallController.otp);
router.get('/resendOtp',loginallController.resendOtp)
router.post("/otppost",loginallController.otppost);


// forgot pass

router.get("/forgotpass",loginallController.forgotpass);
router.post("/forgotpost",loginallController.forgotpost);
router.post("/forgotOTPpost",loginallController.forgotOTPpost);


// home page,product list page,search,sort

router.get("/",homeallController.landingpage);
router.get("/home", isAuthicated,homeallController.home);
router.get("/search",homeallController.search);

router.get('/productlistPage',homeallController.productlistPage)
router.get("/searchpage", homeallController.searchpage);
router.get('/productsSortAndFilter',isAuthicated,homeallController.productsSortAndFilter)

router.get("/landPctDls/:id", homeallController.landPctDls);


// user addwishlist

router.get("/getwishlist",isAuthicated, usercontroller.getwishlist);
router.post("/addwishlist/:id",isAuthicated, usercontroller.addwishlist);
router.post("/removefromwishlist/:id",isAuthicated, usercontroller.removefromwishlist);


// usercart page

router.get("/usercart",isAuthicated,cartcontroller.usercart); 
router.get("/deleteCart/:_id",isAuthicated,cartcontroller.deleteCart);
router.post("/incDecPost/:productId",isAuthicated, usercontroller.incDecPost);
router.post("/addtocart/:id",isAuthicated, cartcontroller.addtocart);


// usercheckout page

router.get("/usercheckout",isAuthicated, usercontroller.usercheckout);
router.post("/userCheckoutPost",isAuthicated, usercontroller.userCheckoutPost);


// apply coupon

router.post('/applyCoupon',isAuthicated,couponController.applyCoupon)


// cheackout to orderSuccess page

router.post("/createOrder",isAuthicated, orderController.createOrder);

router.post("/sucessOrderRuntime",isAuthicated,orderController.sucessOrderRuntime);

router.get("/ordersuccess",isAuthicated,orderController.ordersucess);

router.get("/userorderdetail",isAuthicated,orderController.userorderdetail);
router.post("/cancelorder/:_id/:proid",isAuthicated,orderController.cancelorder);
router.post('/returnOrder',isAuthicated,orderController.returnOrder)
router.get('/orderDetailsPage/:proId/:id',isAuthicated,orderController.orderDetailsPage)

// walletpage

router.get("/wallet",isAuthicated,  orderController.wallet);
router.get("/walletPayMent",isAuthicated, orderController.walletPayMent);
router.post("/paymentFailure",isAuthicated, orderController.paymentFailure);
router.get("/paymentFailedPage",isAuthicated, orderController.paymentFailedPage);
router.post("/paymentRetry",isAuthicated, orderController.paymentRetry);



// user profile

router.get("/userprofile",isAuthicated, userprofileController.userprofile);
router.get("/userchangepass",isAuthicated,userprofileController.userchangepass);
router.post("/userChangePassPost",isAuthicated, userprofileController.userChangePassPost);


router.get("/editaddress/:_id/:i",isAuthicated, addressbookController.editaddress);
router.post("/editaddresspost",isAuthicated, addressbookController.editaddresspost);
router.get("/deleteaddress/:id",isAuthicated,  addressbookController.deleteaddress);
router.post("/userEditAddressPost",isAuthicated,  addressbookController.userEditAddressPost);
router.get("/addressbook",isAuthicated, addressbookController.addressbook);
router.post("/addressbookpost",isAuthicated,addressbookController.addressbookpost);











// --------------------------------------------------------------------------------------------------------
module.exports = router;
