//review - rating - createdAt - ref to course -ref to user
const mongoose = require('mongoose');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema({
 
  review: {
    type: String,
    required: [true, 'Please provide a review'],
    trim: true,
  },
  rating: {
    type: Number,
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
  },
});

// Prevent duplicate reviews by the same user for the same course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Course = mongoose.model('Course');

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.course);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getFilter()); // this.r = document
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.course);
  }
});
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user' }).populate({ path: 'course', select: 'name' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
