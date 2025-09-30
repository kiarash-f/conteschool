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
  console.log('Fetching all courses...');
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
  if (req.files['Image'] && req.files['Image'][0]) {
    req.body.Image = `https://conteschool.ir/uploads/${req.files['Image'][0].filename}`;
  }

  if (req.files['courseImages']) {
    req.body.courseImages = req.files['courseImages'].map(
      (file) => `https://conteschool.ir/uploads/${file.filename}`
    );
  }

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

  if (req.files && req.files['Image'] && req.files['Image'][0]) {
    req.body.Image = `https://conteschool.ir/uploads/${req.files['Image'][0].filename}`;
  }

  if (req.files && req.files['courseImages']) {
    req.body.courseImages = req.files['courseImages'].map(
      (file) => `https://conteschool.ir/uploads/${file.filename}`
    );
  }
  if (req.body.toggleActive) {
    req.body.isActive = !course.isActive;
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
exports.getEnrolledStudents = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'enrolledStudents',
    populate: {
      path: 'enrolledCourses', // field in User model
    },
  });

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
exports.getAllEnrolledStudents = catchAsync(async (req, res, next) => {
  const students = await User.find({
    enrolledCourses: { $exists: true, $not: { $size: 0 } },
  }).populate('enrolledCourses'); // Only works if enrolledCourses stores Course ObjectIds

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: { students },
  });
});

exports.addUserToCourse = catchAsync(async (req, res, next) => {
  const { userId, courseId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  if (course.availableSeats <= 0) {
    return next(new AppError('No available seats in this course', 400));
  }
  user.enrolledCourses.push(courseId);
  await user.save();
  course.enrolledStudents.push(userId);
  course.availableSeats -= 1;
  await course.save();
  res.status(200).json({
    status: 'success',
    message: 'User enrolled in course successfully',
  });
});
exports.removeStudentFromCourse = catchAsync(async (req, res, next) => {
  const { userId, courseId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // remove course from user's enrolledCourses (object array)
  user.enrolledCourses = user.enrolledCourses.filter(
    (c) => c._id.toString() !== courseId
  );
  await user.save();

  // remove user from course's enrolledStudents
  course.enrolledStudents = course.enrolledStudents.filter(
    (student) => student.toString() !== userId
  );

  if (course.availableSeats < course.maxcapacity) {
    course.availableSeats += 1;
  }
  await course.save();

  res.status(200).json({
    status: 'success',
    message: 'User removed from course successfully',
  });
});
