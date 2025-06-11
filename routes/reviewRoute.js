const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.route('/').get(reviewController.getAllReviews);

router.use(authController.protect);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

  router.route('/:courseId/reviews').post(reviewController.createReview);


module.exports = router;
