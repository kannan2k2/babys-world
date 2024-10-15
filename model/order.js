const mongoose = require("mongoose");
// const connect= mongoose.connect('mongodb://localhost:27017/babysworld')

// connect
// .then(()=>{
//     console.log('Order connect successfully')
// }).catch(()=>{
//     console.log('order is not connect')
// })

const orderItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      orderStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled","Returned"],
        default: "Pending",
      },
      reason: {
        type: String,
        required: false,
      },
    },
  ],
  address: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      // enum: ['Cash on Delivery', 'Credit/Debit Card', 'Paypal'] // You can add more methods here
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,  
  },
  // -----------------------------------------
  createdAt: {
    type: Date,
    default: Date.now,
  },  

});

const Order = mongoose.model("Order", orderItemSchema);

module.exports = { Order };
