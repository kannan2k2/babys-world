const mongoose = require("mongoose");
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// connect
//   .then(() => {
//     console.log("cart database is connect");
//   })
//   .catch(() => {
//     console.log("cart is not connect");
//   });

const cartItemSchema = new mongoose.Schema({
  Product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min:1
  },

  // Productname: {
  //   type: String,
  //   required: true,
  // },

  price: {
    type: Number,
    required: true,
  },
});

const CartItem = mongoose.model("CartItem", cartItemSchema);

const cartSchema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  
  couponid : { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon',required : false },
  totalPrice: {
     type: Number,
    default: 0,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = {
  Cart,
  CartItem,
};
