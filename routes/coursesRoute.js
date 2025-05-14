const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');
const upload = require('../controllers/uploadController');

const router = express.Router();
// routes/courseRoutes.js
router.patch('/enroll', coursesController.enrollStudent); //handle user enrollment
router.get('/:id/enrolled-students', coursesController.getEnrolledStudents); //get user who enrolled in the course

router.route('/').get(coursesController.getAllCourses).post(
  authController.protect,
  authController.restrictTo('admin'),
  upload.single('image'), // Upload course image
  coursesController.createCourse
);
router
  .route('/:id')
  .get(coursesController.getCourse)
  .patch(
    coursesController.updateCourse,
    authController.protect,
    authController.restrictTo('admin')
  )
  .delete(
    coursesController.deleteCourse,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
