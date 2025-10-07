const express = require('express');
const authController = require('.././controllers/authController');
const paymentController = require('../controllers/paymentController'); 

const router = express.Router();


router.post(
  '/request',
  authController.protect,
  paymentController.requestPayment
);


router.get('/verify', paymentController.verifyPayment);


router.get('/result', paymentController.getPaymentResult);

router.get(
  '/all',
  authController.protect,
  authController.restrictTo('admin'),
  paymentController.getAllPayments
);

module.exports = router;
