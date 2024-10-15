const mongoose = require('mongoose');
// const connect =mongoose.connect('mongodb://localhost:27017/babysworld')


// connect
// .then(()=>{
//     console.log('useraddress connect to database')
// })
// .catch(()=>{
//     console.log('user address not connect to database')
// })
const addressSchema = new mongoose.Schema({
    // user_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    first_name: {
        type: String,
        required: true,
        maxlength: 50
    },
    last_name: {
        type: String,
        required: true,
        maxlength: 50
    },
    
    email: {
        type: String,
        required: true,
        maxlength: 100
    },
    address: {
        type: String,
        required: true,
        maxlength: 255
    },
    city: {
        type: String,
        required: true,
        maxlength: 100
    },
    Land_Mark: {
        type: String,
        maxlength: 50
    },
    postal_code: {
        type: String,
        maxlength: 20
    },
    // zip: {
    //     type: String,
    //     maxlength: 20
    // },
    
    // is_saved: {
    //     type: Boolean,
    //     default: false
    // },
    // created_at: {
    //     type: Date,
    //     default: Date.now
    // },
    // updated_at: {
    //     type: Date,
    //     default: Date.now
    // }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
