const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const courseController = require('../controllers/coursesController');
const authLimiters = require('../utils/authLimiters');

const router = express.Router();

router.post('/signup', authLimiters.signupPerIp, authController.signup);
router.post('/login', authLimiters.login, authController.login);
router.post('/logout', authController.logout);

router.use(authController.protect);

router.post(
  '/:userId/courses/:courseId',
  authController.restrictTo('admin'),
  courseController.addUserToCourse,
);
router.delete(
  '/:userId/courses/:courseId',
  authController.restrictTo('admin'),
  courseController.removeStudentFromCourse,
);

router.get('/', authController.restrictTo('admin'), userController.getAllUsers);

router.get('/me', authController.getMe, userController.getUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
