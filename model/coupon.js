const mongoose = require("mongoose");
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// // Define Category Schema
// connect
//   .then(() => {
//     console.log("couponSchema database is connect");
//   })
//   .catch(() => {
//     console.log("couponSchema is not connect");
//   });

  const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: 
        String,
        enum: ['active', 'inactive', ],
        required: true
    },
    minDiscountAmount: {
      type: Number,
      
    },
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;