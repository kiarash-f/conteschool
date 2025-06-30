const express = require('express');
const studentWorkController = require('../controllers/studentWorkController');
const authController = require('../controllers/authController');
const { courseUpload } = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(studentWorkController.getAllStudentWorks)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    courseUpload,
    studentWorkController.createStudentWork
  );
router
  .route('/:id')

  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    courseUpload,
    studentWorkController.updateStudentWork
  )
  .delete(
    studentWorkController.deleteStudentWork,
    authController.protect,
    authController.restrictTo('admin')
  );
router.route('/:slug').get(studentWorkController.getStudentWork);

module.exports = router;
