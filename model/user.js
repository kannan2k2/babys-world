const mongoose = require("mongoose");

// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// // check if the database connects or not
// connect
//   .then(() => {
//     console.log("User database connected successfully");
//   })
//   .catch((error) => {
//     console.error("User not connected to MongoDB", error);
//   });

  function generateUniqueReferralCode() {
    // Example: Generate a random string of 6 characters
    return Math.random().toString(36).substring(2, 8);
  }

const LoginSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  referalCode: {
    type: String,
    unique: true
  
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  address: [
    {
      name: {
        type: String,
        required: true,
      },
      // phone: {
      //   type: Number,
      //   required: true,
      //   validate: {
      //     validator: function(v) {
      //       return /^\d{10}$/.test(v);
      //     },
      //     message: props => `${props.value} is not a valid 10-digit phone number!`
      //   },
      // },
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
        type: Number,
        required: true,
      },
    },
  ],
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          default: 0,
        },
        description: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        
      },
    ],
  },
});

// Pre-save hook to generate a unique referral code
LoginSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(); // Skip if the document is not new
  }

  // Generate a unique referral code
  this.referalCode = generateUniqueReferralCode();

  next();
});

LoginSchema.index({ email: 1 }, { unique: true });
LoginSchema.index({ referalCode: 1 }, { unique: true }); // Enforce uniqueness on referalCode
const User = mongoose.model("User", LoginSchema);

module.exports = User;
