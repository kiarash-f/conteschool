//review - rating - createdAt - ref to course -ref to user 
const mongoose = require('mongoose');
const User = require('./userModel');
const Course = require('./courseModel');


const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true, 'Please provide a review'],
        trim: true,
    },
    rating:{
        type:Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5,
    },
  createdAt: {
        type: Date,
        default: Date.now,
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'Review must belong to a course'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
    }
});


// Prevent duplicate reviews by the same user for the same course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });





const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;