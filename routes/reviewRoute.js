const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('admin'), reviewController.getAllReviews);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

router.route('/:courseId/reviews').post(reviewController.createReview);

module.exports = router;
