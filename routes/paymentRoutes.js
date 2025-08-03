const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post(
  '/request',
  authController.protect,
  paymentController.requestPayment
);
router.get('/verify', paymentController.verifyPayment);

module.exports = router;
