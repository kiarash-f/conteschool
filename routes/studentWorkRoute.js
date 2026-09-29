const express = require('express');
const studentWorkController = require('../controllers/studentWorkController');
const authController = require('../controllers/authController');
const { imageUpload } = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(studentWorkController.getAllStudentWorks)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    studentWorkController.createStudentWork,
  );
router
  .route('/:id')
  .get(studentWorkController.getStudentWork)

  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    studentWorkController.updateStudentWork,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    studentWorkController.deleteStudentWork,
  );

module.exports = router;
