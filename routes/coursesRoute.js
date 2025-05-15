const express = require('express');
const coursesController = require('../controllers/coursesController');
const authController = require('../controllers/authController');
const { upload, compressImage } = require('../controllers/uploadController');

const router = express.Router();

router.patch('/enroll', coursesController.enrollStudent);
router.get('/:id/enrolled-students', coursesController.getEnrolledStudents);

router
  .route('/')
  .get(coursesController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    upload.single('image'),      // Upload image
    compressImage,               // Compress it
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
