const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');
const upload = require('../controllers/uploadController');

const router = express.Router();

// router.patch('/enroll', coursesController.enrollStudent);
router.get('/:id/enrolled-students', coursesController.getEnrolledStudents);
router.post(
  '/request-link/:courseId',
  authController.protect,
  coursesController.requestPaymentLink
);
router.get('/verify/:token', coursesController.verifyCourseToken);
router.post('/pay/:token', coursesController.confirmPayment);

router
  .route('/')
  .get(coursesController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    upload.single('image'),
    coursesController.createCourse
  );

router
  .route('/:id')
  .get(coursesController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    upload.single('image'),
    coursesController.updateCourse,
  )
  .delete(
    coursesController.deleteCourse,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
