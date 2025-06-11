const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/reviewModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');



exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query.populate('user course');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate('User Course');

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating} = req.body;
  const {courseId}  = req.params;

  if (!review || !rating ) {
    return next(new AppError('Please provide review, rating ', 400));
  }

  // Check if course exists
  const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }
    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
        course: courseId,
        user: req.user._id,
    });
    if (existingReview) {
        return next(new AppError('You have already reviewed this course', 400));
    }
    // Create new review
    const newReview = await Review.create({
        review,
        rating,
        course: courseId,
        user: req.user._id,
    });
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
}
);
exports.updateReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;

  if (!review && !rating) {
    return next(new AppError('Please provide review or rating to update', 400));
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { review, rating },
    { new: true, runValidators: true }
  ).populate('user course');

  if (!updatedReview) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});