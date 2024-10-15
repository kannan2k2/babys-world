const mongoose = require("mongoose");
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// // Define Product Schema

// connect
//   .then(() => {
//     console.log("product connect successfully");
//   })
//   .catch(() => {
//     console.log("product database not connect");
//   });
const productSchema = new mongoose.Schema({
  ProductName: {
    type: String,
    required: true,
  },
  Mrp : {
    type: Number,
    required: true,
    
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Category"
  },
  description: {
    type: String,
  },
  image: {
      type: Array
  },
  stock: {
    type: Number,
    required: true,
  },
  isListed: {
    type: Boolean,
    default: true,
}

  // createdAt: {
  //     type: Date,
  //     default: Date.now
  // },
  // updatedAt: {
  //     type: Date,
  //     default: Date.now
  // }
 
});

// Create Product Model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
