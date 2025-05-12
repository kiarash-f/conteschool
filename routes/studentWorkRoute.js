const express = require('express');
const studentWorkController = require('../controllers/studentWorkController');

const router = express.Router();

router
  .route('/')
  .get(studentWorkController.getAllStudentWorks)
  .post(studentWorkController.createStudentWork);
router
  .route('/:id')
  .get(studentWorkController.getStudentWork)
  .patch(studentWorkController.updateStudentWork)
  .delete(studentWorkController.deleteStudentWork);

module.exports = router;
