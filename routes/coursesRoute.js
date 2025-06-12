const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');
const { courseUpload } = require('../controllers/uploadController'); // Updated import

const router = express.Router();

router.get('/enrolled-students', coursesController.getAllEnrolledStudents);
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
    courseUpload,
    coursesController.createCourse
  );

router
  .route('/:id')
  .get(coursesController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    courseUpload, 
    coursesController.updateCourse
  )
  .delete(
    coursesController.deleteCourse,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
