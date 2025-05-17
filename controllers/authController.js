const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { promisify } = require('util');

const otpStore = {};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send OTP (for login or signup)
exports.sendOtp = catchAsync(async (req, res, next) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    return next(new AppError('Please provide email or phone number', 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const key = phone || email;
  otpStore[key] = otp;

  console.log(`Mock OTP for ${key}: ${otp}`);

  res.json({ status: 'OTP sent successfully' });
});

// Signup with OTP
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, phone, otp } = req.body;

  const key = phone || email;
  if (!otpStore[key] || otpStore[key] !== otp) {
    return next(new AppError('Invalid or expired OTP', 400));
  }
  delete otpStore[key];

  const newUser = await User.create({
    name,
    email,
    phone,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// Login with OTP
exports.login = catchAsync(async (req, res, next) => {
  const { phone, email, otp } = req.body;

  const key = phone || email;
  if (!otpStore[key] || otpStore[key] !== otp) {
    return next(new AppError('Invalid or expired OTP', 400));
  }
  delete otpStore[key];

  const user = await User.findOne(phone ? { phone } : { email });
  if (!user) {
    return next(new AppError('User not found. Please sign up first.', 404));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// Protect routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  req.user = currentUser;
  next();
});

// Restrict to roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
