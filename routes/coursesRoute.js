const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');
const { imageUpload } = require('../controllers/uploadController');

const router = express.Router();

router.get('/enrolled-students', coursesController.getAllEnrolledStudents);
router.get('/:id/enrolled-students', coursesController.getEnrolledStudents);


router
  .route('/')
  .get(coursesController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    coursesController.createCourse
  );

router
  .route('/:id')
  .get(coursesController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    coursesController.updateCourse
  )
  .delete(
    coursesController.deleteCourse,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
