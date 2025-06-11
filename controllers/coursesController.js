const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const upload = require('./uploadController');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const authController = require('./authController');
const jwt = require('jsonwebtoken');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Execute query
  const features = new APIFeatures(Course.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const courses = await features.query.populate({
    path: 'reviews',
    populate: { path: 'user' },
  });

  // Send response
  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses,
    },
  });
});
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'reviews',
    populate: { path: 'user' },
  });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});
exports.createCourse = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image for the course', 400));
  }

  req.body.Image = `http://localhost:3000/uploads/${req.file.filename}`;

  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse,
    },
  });
});
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  if (req.file) {
    req.body.Image = req.file.filename;
  } else {
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      course: updatedCourse,
    },
  });
});
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// exports.enrollStudent = catchAsync(async (req, res, next) => {
//   // console.log('req.body:', req.body);

//   const { courseId, userId } = req.body;

//   const course = await Course.findById(courseId);
//   const user = await User.findById(userId);

//   if (!course || !user) {
//     return next(new AppError('User or Course not found', 404));
//   }

//   if (course.availableSeats <= 0) {
//     return next(new AppError('No available seats for this course', 400));
//   }

//   // Prevent duplicate enrollment
//   if (course.enrolledStudents.includes(userId)) {
//     return next(new AppError('User already enrolled in this course', 400));
//   }

//   // Update course
//   course.enrolledStudents.push(userId);
//   course.availableSeats -= 1;
//   await course.save();

//   // Update user
//   user.enrolledCourses.push(courseId);
//   await user.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'User enrolled in course',
//     data: {
//       course,
//       user,
//     },
//   });
// });
exports.getEnrolledStudents = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    'enrolledStudents'
  );

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: course.enrolledStudents.length,
    data: {
      students: course.enrolledStudents,
    },
  });
});
//TODO: Implement muck payment link generation and confirmation
// POST /api/courses/:courseId/request-payment-link
exports.requestPaymentLink = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const user = req.user;

  const contact = user.phone || user.email;
  if (!contact) {
    return next(
      new AppError(
        'User must have a phone or email to receive payment link',
        400
      )
    );
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Generate token with student and course info
  const token = jwt.sign(
    {
      studentId: user._id,
      courseId: course._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token valid for 1 hour
  );

  const link = `https://yourdomain.com/pay-course/${token}`;

  // Send SMS or email
  await sendSMS(contact, `Here's your course payment link: ${link}`);

  res.status(200).json({
    status: 'success',
    message: 'Payment link sent',
  });
});

exports.verifyCourseToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  const { studentId, courseId } = decoded;

  const user = await User.findById(studentId);
  const course = await Course.findById(courseId);

  if (!user || !course) {
    return next(new AppError('User or course not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
      course: {
        name: course.name,
        description: course.description,
        price: course.price,
      },
    },
  });
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 400));
  }

  const { studentId, courseId } = decoded;

  const course = await Course.findById(courseId);
  const user = await User.findById(studentId);

  if (!course || !user) {
    return next(new AppError('User or course not found', 404));
  }

  user.enrolledCourses.push(courseId);
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Payment confirmed and course added to profile',
  });
});
//TODO: Implement sendSMS function
//TODO: postman for verify token and confirm payment

//TODO: voice review, codify course model for sub-courses
//TODO: link send to user for payment, payment method
//TODO: api for email LIARA, delete the useless routes
