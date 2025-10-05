// controllers/zarinpalController.js
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Payment = require('../models/payment');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const { notifyAdminSMS, notifyStudentSMS } = require('../utils/sms');

require('dotenv').config();

const isSandbox = process.env.ZARINPAL_ENV === 'sandbox';

// Host URLs
const HOST_WEB = isSandbox
  ? 'https://sandbox.zarinpal.com'
  : 'https://www.zarinpal.com';
const HOST_API = isSandbox
  ? 'https://sandbox.zarinpal.com'
  : 'https://api.zarinpal.com';

const REQ_URL = `${HOST_API}/pg/v4/payment/request.json`;
const VERIFY_URL = `${HOST_API}/pg/v4/payment/verify.json`;

const normalizeAmountToRial = (amount, amountIsToman = true) => {
  const num = Number(amount);
  if (Number.isNaN(num) || num <= 0) return 0;
  return amountIsToman ? Math.round(num * 10) : Math.round(num);
};

exports.requestPayment = catchAsync(async (req, res, next) => {
  const { amount, description, email, mobile, courseId } = req.body;
  const studentId = req.user && req.user._id;
  if (!amount || !studentId) {
    return next(new AppError('پارامترهای لازم ارسال نشده‌اند', 400));
  }

  const amountRial = normalizeAmountToRial(amount);

  const payload = {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: amountRial,
    callback_url: process.env.ZARINPAL_CALLBACK_URL,
    description: description || `پرداخت کاربر ${studentId}`,
    metadata: { email, mobile },
  };

  // call Zarinpal request
  const response = await axios.post(REQ_URL, payload).catch((err) => {
    // network / 5xx handling
    throw new AppError('خطا در ارتباط با درگاه پرداخت', 502);
  });

  const data = response.data;
  const code = data?.data?.code;

  if (code === 100 && data.data.authority) {
    const authority = data.data.authority;
    const payUrl = `${HOST_WEB}/pg/StartPay/${authority}`;

    // create pending payment record (idempotent: if same authority exists, skip create)
    await Payment.findOneAndUpdate(
      { authority },
      {
        authority,
        amount: amountRial,
        description: payload.description,
        email,
        mobile,
        student: studentId,
        course: courseId || null,
        status: 'pending',
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    if (isSandbox) {
      console.log('💡 Sandbox Payment Requested:', { authority, payUrl });
    }

    return res.status(200).json({ url: payUrl, authority });
  }

  // other codes -> return error with info if available
  return next(new AppError('خطا در ایجاد تراکنش پرداخت', 400));
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { Authority, Status } = req.query;

  if (!Authority)
    return next(new AppError('پارامتر Authority موجود نیست', 400));

  // find the payment created earlier
  const payment = await Payment.findOne({ authority: Authority });
  if (!payment) {
    // still try to call verify? safer to return not found
    return next(new AppError('پرداخت پیدا نشد', 404));
  }

  // if user cancelled on gateway
  if (Status !== 'OK') {
    payment.status = 'failed';
    await payment.save().catch(() => {});
    return res.status(400).json({ success: false, message: 'پرداخت لغو شد' });
  }

  // call verify endpoint
  const verifyPayload = {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: payment.amount, // stored in RIAL
    authority: Authority,
  };

  const response = await axios.post(VERIFY_URL, verifyPayload).catch((err) => {
    // network error
    throw new AppError('خطا در ارتباط با سرویس تأیید پرداخت', 502);
  });

  const data = response.data;
  const code = data?.data?.code;

  // success codes: 100 (first confirm), 101 (already confirmed)
  if (code === 100 || code === 101) {
    const refId = data.data.ref_id || null;

    // store success, ref_id and any optional fields
    payment.status = 'success';
    payment.ref_id = refId;
    if (data.data.card_pan) payment.card_pan = data.data.card_pan;
    if (data.data.fee !== undefined) payment.fee = data.data.fee;
    payment.verifiedAt = new Date();
    await payment.save();

    // Enroll user to course idempotently
    if (payment.course) {
      await User.findByIdAndUpdate(payment.student, {
        $addToSet: { enrolledCourses: payment.course },
      });
    }

    // fetch course/user for notification
    const course = payment.course
      ? await Course.findById(payment.course)
      : null;
    const student = await User.findById(payment.student);

    // Notify admin & student (if notifyStudentSMS exists)
    try {
      await notifyAdminSMS(payment, course, student);
    } catch (e) {
      console.error('notifyAdminSMS error:', e);
    }

    try {
      if (typeof notifyStudentSMS === 'function') {
        await notifyStudentSMS(payment, course, student);
      }
    } catch (e) {
      console.error('notifyStudentSMS error:', e);
    }

    return res.status(200).json({
      success: true,
      message:
        code === 100
          ? 'پرداخت با موفقیت تأیید شد'
          : 'تراکنش قبلاً تأیید شده بود',
      refId,
    });
  }

  // failed: update payment and return errors if available
  payment.status = 'failed';
  await payment.save().catch(() => {});

  return res.status(400).json({
    success: false,
    message: 'پرداخت ناموفق بود',
    errors: data?.errors || data,
  });
});
