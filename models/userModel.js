const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const courseModel = require('./courseModel'); 

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
    unique: true
  },
  profilePicture: {
    type: String,
    default: '' // store URL or filename
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 6,
    select: false // won't return password by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must confirm the password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
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
        ref: 'Course'
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
      },
      reserved: {
        type: Boolean,
        default: false
      }
    }
  ],
  reviews: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


// Compare password method for login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
