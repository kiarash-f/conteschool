// routes/paymentRoutes.js
const express = require('express');
const authController = require('.././controllers/authController');
const paymentController = require('../controllers/paymentController'); // <- this file exists

const router = express.Router();

// user starts a payment (needs auth)
router.post(
  '/request',
  authController.protect,
  paymentController.requestPayment
);

// Zarinpal callback (PUBLIC – do NOT protect)
router.get('/verify', paymentController.verifyPayment);

// Optional: frontend pulls final status/details by authority
router.get('/result', paymentController.getPaymentResult);

router.get(
  '/all',
  authController.protect,
  authController.restrictTo('admin'),
  paymentController.getAllPayments
);

module.exports = router;
