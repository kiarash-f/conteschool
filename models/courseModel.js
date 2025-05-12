const mongoose = require('mongoose');
const User = require('./userModel'); 

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A course must have a name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'A course must have a description'],
    },
    duration: {
        type: Number,
        required: [true, 'A course must have a duration'],
    },
    price: {
        type: Number,
        required: [true, 'A course must have a price'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    Image:{
        type:String,
        required:[true,'A course must have an image']
    },
       startDate: {
        type: Date,
        required: [true, 'A course must have a start date']
    },
    availableSeats: {
        type: Number,
        required: [true, 'You must set available seats'],
        min: [0, 'Available seats cannot be negative']
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true // to toggle course visibility
    }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;