const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    oreLevel: {
        type: Number,
        required: false
    },
    timLevel: {
        type: Number,
        required: false
    },
    oreCost: {
        type: Number,
        required:false
    },
    timCost: {
        type: Number,
        required: false
    }
});


const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;