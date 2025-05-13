const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');

const router = express.Router();
// routes/courseRoutes.js
router.patch('/enroll', coursesController.enrollStudent);//handle user enrollment
router.get('/:id/enrolled-students', coursesController.getEnrolledStudents);//get user who enrolled in the course

router
  .route('/')
  .get(coursesController.getAllCourses)
  .post(
    coursesController.createCourse,
    authController.protect,
    authController.restrictTo('admin')
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
