const express = require('express');
const studentWorkController = require('../controllers/studentWorkController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(studentWorkController.getAllStudentWorks)
  .post(
    studentWorkController.createStudentWork,
    authController.protect,
    authController.restrictTo('admin')
  );
router
  .route('/:id')
  .get(studentWorkController.getStudentWork)
  .patch(
    studentWorkController.updateStudentWork,
    authController.protect,
    authController.restrictTo('admin')
  )
  .delete(
    studentWorkController.deleteStudentWork,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
