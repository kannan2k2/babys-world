const mongoose = require("mongoose");
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// // Define Category Schema
// connect
//   .then(() => {
//     console.log("category database is connect");
//   })
//   .catch(() => {
//     console.log("category is not connect");
//   });
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  discountoffer: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  // createdAt: {
  //     type: Date,
  //     default: Date.now
  // },
  // updatedAt: {
  //     type: Date,
  //     default: Date.now
  // }
});

// Create Category Model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
