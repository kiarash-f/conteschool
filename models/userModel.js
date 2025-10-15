const mongoose = require('mongoose');
const Course = require('./courseModel');
const Review = require('./reviewModel');

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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  enrolledCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      paymentStatus: { type: String, default: 'pending' },
      reserved: { type: Boolean, default: false },
      enrolledAt: { type: Date, default: Date.now },
      payment: {
        authority: { type: String, default: null },
        refId: { type: String, default: null },
      },
      tncAccepted: { type: Boolean, default: false },
      tncAcceptedAt: { type: Date, default: null },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id',
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
