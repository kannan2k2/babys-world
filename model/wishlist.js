const mongoose = require('mongoose')
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

//newe
// connect
//   .then(() => {
//     console.log("Wishlist database is connect");
//   })
//   .catch(() => {
//     console.log("Wishlist is not connect");
//   });

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        
    },
    items: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
            required: true
        },
    }]
})

const wishlist = mongoose.model('wishlist', wishlistSchema)
module.exports = wishlist
