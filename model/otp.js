const mongoose = require("mongoose");
// const connect = mongoose.connect("mongodb://localhost:27017/babysworld");

// connect
// .then(()=>{
//     console.log('OTP connect successfully')
// }).catch(()=>{
//     console.log('OTP is not connect')
// })

const otpSchema=new mongoose.Schema({
    email:{type:String,
        require:true
    },

    otp:{type:String,
        require:true
    },
     createdAt:{type:Date,
        require:true,
        default:Date.noe
     },   
   
})

// Index to enforce expiration
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 })

const OTP=mongoose.model('OTP',otpSchema)

module.exports=OTP;