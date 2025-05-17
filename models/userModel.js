const mongoose = require('mongoose');
const Course = require('./courseModel');

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
  phone: {
    type: String,
    required: [true, 'A user must have a phone number for OTP'],
    unique: true,
  },
  profilePicture: {
    type: String,
    default: '', // store URL or filename
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  enrolledCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      reserved: {
        type: Boolean,
        default: false,
      },
    },
  ],
  reviews: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
