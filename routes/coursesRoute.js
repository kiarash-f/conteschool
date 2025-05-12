const express = require('express');
const coursesController = require('../controllers/coursesController');

const router = express.Router();
// const authController = require('../controllers/authController');

router
  .route('/')
  .get(coursesController.getAllCourses)
  .post(coursesController.createCourse);
router
  .route('/:id')
  .get(coursesController.getCourse)
  .patch(coursesController.updateCourse)
  .delete(coursesController.deleteCourse);

module.exports = router;
