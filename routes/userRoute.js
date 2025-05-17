const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// OTP Auth routes
router.post('/send-otp', authController.sendOtp);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protect all routes below this middleware
router.use(authController.protect);

// User data routes (protected)
router.get('/', userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
