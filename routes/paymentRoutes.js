const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/request', paymentController.requestPayment);
router.get('/verify', paymentController.verifyPayment);


module.exports = router;