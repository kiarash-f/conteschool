const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const {
  generateOTP,
  saveOTP,
  verifyOTP,
  clearOTP,
  sendMockOTP,
} = require('../utils/otp');
// const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, phone, otp } = req.body;
  const key = phone || email;

  if (!key) {
    return next(new AppError('Please provide phone or email', 400));
  }

  if (!otp) {
    // STEP 1: Generate and send OTP
    const generatedOtp = generateOTP();
    saveOTP(key, generatedOtp);
    sendMockOTP(key, generatedOtp);

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent. Please verify to complete login.',
    });
  }

  // STEP 2: Verify OTP
  if (!verifyOTP(key, otp)) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // Check if user exists
  const user = await User.findOne(phone ? { phone } : { email });
  if (!user) {
    // Do NOT clear OTP — allow reuse for signup
    return next(new AppError('User not found. Please sign up first.', 404));
  }

  // Login successful → now clear OTP
  clearOTP(key);

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, phone, otp } = req.body;
  const key = phone || email;

  if (!key) {
    return next(new AppError('Please provide phone or email', 400));
  }

  if (!otp) {
    const generatedOtp = generateOTP();
    saveOTP(key, generatedOtp);
    sendMockOTP(key, generatedOtp);

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent. Please verify to complete signup.',
    });
  }

  if (!verifyOTP(key, otp)) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne(phone ? { phone } : { email });
  if (existingUser) {
    return next(new AppError('User already exists. Please login.', 400));
  }

  // Signup success → now clear OTP
  clearOTP(key);

  const newUser = await User.create({ name, email, phone });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
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
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
