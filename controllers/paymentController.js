const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Payment = require('../models/payment');
const payment = require('../models/payment');

require('dotenv').config();

const ZARINPAL_API =
  process.env.ZARINPAL_ENV === 'sandbox'
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://api.zarinpal.com/pg/v4/payment';

exports.requestPayment = catchAsync(async (req, res, next) => {
  const { amount, description, email, mobile } = req.body;

  const response = await axios.post(`${ZARINPAL_API}/request.json`, {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: Number(amount),
    callback_url: process.env.ZARINPAL_CALLBACK_URL,
    description,
    metadata: {
      email,
      mobile,
    },
  });

  const data = response.data;

  if (data?.data?.code === 100) {
    const authority = data.data.authority;
    const payUrl = `${ZARINPAL_API.replace(
      '/pg/v4/payment',
      ''
    )}/pg/StartPay/${authority}`;
    await Payment.create({
      authority,
      amount: Number(amount),
      description,
      email,
      mobile,
      status: 'pending',
    });

    if (process.env.ZARINPAL_ENV === 'sandbox') {
      console.log('💡 Sandbox Payment Requested:');
      console.log('Authority:', authority);
      console.log('URL:', payUrl);
    }

    return res.status(200).json({ url: payUrl, authority });
  } else {
    return next(new AppError('error during payment', 400));
  }
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { Authority, Status } = req.query;

  if (Status !== 'OK') {
   
    await Payment.findOneAndUpdate(
      { authority: Authority },
      { status: 'failed' }
    );
    return res.status(400).json({ success: false, message: 'پرداخت لغو شد' });
  }

  const payment = await Payment.findOne({ authority: Authority });

  if (!payment) {
    return next(new AppError('پرداخت پیدا نشد', 404));
  }

  const response = await axios.post(`${ZARINPAL_API}/verify.json`, {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: payment.amount, 
    authority: Authority,
  });

  const data = response.data;

  if (data?.data?.code === 100) {
    const refId = data.data.ref_id;

    payment.status = 'success';
    payment.ref_id = refId;
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'پرداخت با موفقیت انجام شد',
      refId,
    });
  } else {
    payment.status = 'failed';
    await payment.save();

    return res.status(400).json({
      success: false,
      message: 'پرداخت ناموفق بود',
      errors: data.errors,
    });
  }
});
