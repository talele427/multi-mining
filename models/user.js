const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ores: {
        type: Number,
        required: false
    },
    donated: {
        type: Number,
        required: false
    },
    totalMined: {
        type: Number,
        required:false
    },
    autoMine: {
        type: Boolean,
        required:false
    },
    mineLevel: {
        type: Number,
        required: false
    }
});


const User = mongoose.model('User', userSchema);

module.exports = User;