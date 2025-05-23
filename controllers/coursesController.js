const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const upload = require('./uploadController');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Execute query
  const features = new APIFeatures(Course.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const courses = await features.query;

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
  const course = await Course.findOne({ slug: req.params.slug });

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

  req.body.Image = req.file.filename;

  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse,
    },
  });
});
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
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
exports.enrollStudent = catchAsync(async (req, res, next) => {
  // console.log('req.body:', req.body);

  const { courseId, userId } = req.body;

  const course = await Course.findById(courseId);
  const user = await User.findById(userId);

  if (!course || !user) {
    return next(new AppError('User or Course not found', 404));
  }

  if (course.availableSeats <= 0) {
    return next(new AppError('No available seats for this course', 400));
  }

  // Prevent duplicate enrollment
  if (course.enrolledStudents.includes(userId)) {
    return next(new AppError('User already enrolled in this course', 400));
  }

  // Update course
  course.enrolledStudents.push(userId);
  course.availableSeats -= 1;
  await course.save();

  // Update user
  user.enrolledCourses.push(courseId);
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User enrolled in course',
    data: {
      course,
      user,
    },
  });
});
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
