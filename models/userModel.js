const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must confirm the password'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;