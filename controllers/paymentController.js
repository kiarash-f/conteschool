const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Payment = require('../models/payment');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const { notifyAdminSMS, notifyStudentSMS } = require('../utils/sms');

require('dotenv').config();

const isSandbox = process.env.ZARINPAL_ENV === 'sandbox';
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

// کمکی: true برای ورودی‌های 'true' | '1' | 'on' | 'yes' هم حساب شود
const parseAcceptTnc = (val) => {
  if (val === true) return true;
  if (val === 1) return true;
  const s = (val ?? '').toString().toLowerCase().trim();
  return ['true', '1', 'on', 'yes'].includes(s);
};


// ---------- REQUEST ----------
const requestPayment = catchAsync(async (req, res, next) => {
  const { description, email, mobile, courseId } = req.body;
  const studentId = req.user && req.user._id;

  const acceptTnc = parseAcceptTnc(req.body?.acceptTnc);

  if (!courseId || !studentId) {
    return next(new AppError('پارامترهای لازم ارسال نشده‌اند', 400));
  }

  if (!acceptTnc) {
    return next(new AppError('پذیرش قوانین و مقررات الزامی است', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('دوره پیدا نشد', 404));
  }
  if (course.availableSeats <= 0) {
    return next(new AppError('ظرفیت این دوره تکمیل شده است', 400));
  }

  const amountRial = normalizeAmountToRial(course.price);
  if (!amountRial) return next(new AppError('مبلغ نامعتبر است', 400));

  const callbackUrl =
    process.env.ZARINPAL_CALLBACK_URL ||
    `${process.env.FRONT_URL || 'https://conteschool.ir'}/api/v1/payments/verify`;

  const payload = {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    amount: amountRial,
    callback_url: callbackUrl,
    description: description || `پرداخت کاربر ${studentId}`,
    metadata: { email, mobile },
  };

  let response;
  try {
    response = await axios.post(REQ_URL, payload);
  } catch (e) {
    console.error('Zarinpal payment request failed:', {
      http: e?.response?.status,
      errors: e?.response?.data?.errors,
      code: e?.code,
      message: e?.message,
    });
    throw new AppError('خطا در ارتباط با درگاه پرداخت', 502);
  }

  const data = response.data;
  if (data?.data?.code === 100 && data.data.authority) {
    const authority = data.data.authority;
    const payUrl = `${HOST_WEB}/pg/StartPay/${authority}`;

    await Payment.findOneAndUpdate(
      { authority },
      {
        authority,
        amount: amountRial,
        description: payload.description,
        email,
        mobile,
        student: studentId,
        course: courseId,
        status: 'pending',
        createdAt: new Date(),
      },
      { upsert: true, new: true },
    );

    const upd = await User.updateOne(
      { _id: studentId, 'enrolledCourses.course': courseId },
      {
        $set: {
          'enrolledCourses.$.paymentStatus': 'pending',
          'enrolledCourses.$.reserved': true,
          'enrolledCourses.$.payment.authority': authority,
          'enrolledCourses.$.tncAccepted': true,
          'enrolledCourses.$.tncAcceptedAt': new Date(),
        },
      },
    );

    if (upd.matchedCount === 0) {
      await User.updateOne(
        { _id: studentId },
        {
          $push: {
            enrolledCourses: {
              course: courseId,
              paymentStatus: 'pending',
              reserved: true,
              enrolledAt: new Date(),
              payment: { authority, refId: null },
              tncAccepted: true,
              tncAcceptedAt: new Date(),
            },
          },
        },
      );
    }

    if (isSandbox)
      console.log('💡 Sandbox Payment Requested:', { authority, payUrl });
    return res.status(200).json({ url: payUrl, authority });
  }

  console.error('Zarinpal payment request rejected:', data?.errors || data?.data);
  return next(new AppError('خطا در ایجاد تراکنش پرداخت', 400));
});

// ---------- VERIFY ----------
const verifyPayment = catchAsync(async (req, res, next) => {
  const { Authority, Status } = req.query;
  const FRONT_URL = process.env.FRONT_URL || 'https://conteschool.ir';
  const WANT_JSON = (req.query.return || '').toLowerCase() === 'json';

  if (!Authority)
    return next(new AppError('پارامتر Authority موجود نیست', 400));

  const payment = await Payment.findOne({ authority: Authority });
  if (!payment) return next(new AppError('پرداخت پیدا نشد', 404));

  // user canceled
  if (Status !== 'OK') {
    if (payment.status !== 'success') {
      payment.status = 'failed';
      await payment.save().catch(() => {});
    }
    return WANT_JSON
      ? res.status(400).json({ success: false, message: 'پرداخت لغو شد' })
      : res.redirect(`${FRONT_URL}/payment/result?status=failed`);
  }

  // already confirmed → ensure enrollment
  if (payment.status === 'success' && payment.ref_id) {
    await enrollUserToCourseIdempotent(payment.student, payment.course).catch(
      () => {},
    );

    if (payment.course) {
      await User.updateOne(
        { _id: payment.student, 'enrolledCourses.course': payment.course },
        {
          $set: {
            'enrolledCourses.$.paymentStatus': 'paid',
            'enrolledCourses.$.reserved': false,
            'enrolledCourses.$.payment.authority': payment.authority ?? null,
            'enrolledCourses.$.payment.refId': payment.ref_id ?? null,
          },
        },
      );

      // اگر قبلاً T&C ست نشده بود، الان ست شود
      await User.updateOne(
        {
          _id: payment.student,
          'enrolledCourses.course': payment.course,
          'enrolledCourses.tncAccepted': { $ne: true },
        },
        {
          $set: {
            'enrolledCourses.$.tncAccepted': true,
            'enrolledCourses.$.tncAcceptedAt': new Date(),
          },
        },
      );
    }

    return WANT_JSON
      ? res.status(200).json({
          success: true,
          message: 'قبلاً تأیید شده بود',
          refId: payment.ref_id,
        })
      : res.redirect(
          `${FRONT_URL}/payment/result?authority=${encodeURIComponent(
            Authority,
          )}`,
        );
  }

  // verify with Zarinpal (server-to-server)
  let vr;
  try {
    vr = await axios.post(VERIFY_URL, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: payment.amount, // RIAL from DB
      authority: Authority,
    });
  } catch (e) {
    console.error(
      'Zarinpal verify failed:',
      e?.response?.data || e?.message || e,
    );
    throw new AppError('خطا در ارتباط با سرویس تأیید پرداخت', 502);
  }

  const vdata = vr.data;
  const code = vdata?.data?.code;

  if (code === 100 || code === 101) {
    const refId = vdata.data.ref_id || null;

    payment.status = 'success';
    payment.ref_id = refId;
    if (vdata.data.card_pan) payment.card_pan = vdata.data.card_pan;
    if (typeof vdata.data.fee !== 'undefined') payment.fee = vdata.data.fee;
    payment.verifiedAt = new Date();
    await payment.save();

    // idempotent ثبت‌نام + افزودن T&C در صورت نیاز
    await enrollUserToCourseIdempotent(payment.student, payment.course);

    if (payment.course) {
      await User.updateOne(
        { _id: payment.student, 'enrolledCourses.course': payment.course },
        {
          $set: {
            'enrolledCourses.$.paymentStatus': 'paid',
            'enrolledCourses.$.reserved': false,
            'enrolledCourses.$.enrolledAt': new Date(),
            'enrolledCourses.$.payment.authority': payment.authority ?? null,
            'enrolledCourses.$.payment.refId': refId ?? null,
          },
        },
      );

      // اگر T&C هنوز ست نشده، الان ست کن
      await User.updateOne(
        {
          _id: payment.student,
          'enrolledCourses.course': payment.course,
          'enrolledCourses.tncAccepted': { $ne: true },
        },
        {
          $set: {
            'enrolledCourses.$.tncAccepted': true,
            'enrolledCourses.$.tncAcceptedAt': new Date(),
          },
        },
      );
    }

    try {
      const [course, student] = await Promise.all([
        payment.course ? Course.findById(payment.course) : null,
        User.findById(payment.student),
      ]);
      if (typeof notifyAdminSMS === 'function')
        await notifyAdminSMS(payment, course, student);
      if (typeof notifyStudentSMS === 'function')
        await notifyStudentSMS(payment, course, student);
    } catch (e) {
      console.error('notify error:', e);
    }

    return WANT_JSON
      ? res.status(200).json({
          success: true,
          message:
            code === 100
              ? 'پرداخت با موفقیت تأیید شد'
              : 'تراکنش قبلاً تأیید شده بود',
          refId,
        })
      : res.redirect(
          `${FRONT_URL}/payment/result?authority=${encodeURIComponent(
            Authority,
          )}`,
        );
  }

  // failed
  payment.status = 'failed';
  await payment.save().catch(() => {});
  return WANT_JSON
    ? res.status(400).json({
        success: false,
        message: 'پرداخت ناموفق بود',
        errors: vdata?.errors || vdata,
      })
    : res.redirect(`${FRONT_URL}/payment/result?status=failed`);
});

// ---------- RESULT (frontend helper) ----------
const getPaymentResult = catchAsync(async (req, res, next) => {
  const { authority } = req.query;
  if (!authority) return next(new AppError('authority لازم است', 400));

  const p = await Payment.findOne({ authority })
    .populate({ path: 'course', model: 'Course', select: 'name price' })
    .populate({ path: 'student', model: 'User', select: 'name email' })
    .lean();

  if (!p) return next(new AppError('پرداخت پیدا نشد', 404));

  res.json({
    success: p.status === 'success',
    refId: p.ref_id,
    amount: p.amount,
    course: p.course,
    student: p.student,
    description: p.description,
    createdAt: p.createdAt,
  });
});


// ---------- Helper: idempotent enrollment (no transactions) ----------
async function enrollUserToCourseIdempotent(studentId, courseId) {
  if (!studentId || !courseId) return;

  const [, , courseUpdate] = await Promise.all([
    // اگر وجود ندارد → اضافه کن با T&C
    User.updateOne(
      { _id: studentId, 'enrolledCourses.course': { $ne: courseId } },
      {
        $push: {
          enrolledCourses: {
            course: courseId,
            paymentStatus: 'paid',
            reserved: false,
            enrolledAt: new Date(),
            tncAccepted: true,
            tncAcceptedAt: new Date(),
          },
        },
      },
    ),

    // اگر وجود دارد ولی T&C ست نشده → ست کن
    User.updateOne(
      {
        _id: studentId,
        'enrolledCourses.course': courseId,
        'enrolledCourses.tncAccepted': { $ne: true },
      },
      {
        $set: {
          'enrolledCourses.$.tncAccepted': true,
          'enrolledCourses.$.tncAcceptedAt': new Date(),
        },
      },
    ),

    // add user to course AND decrement seats atomically — only once,
    // only if the student isn't already in the course, only if seats remain
    Course.updateOne(
      {
        _id: courseId,
        enrolledStudents: { $ne: studentId },
        availableSeats: { $gt: 0 },
      },
      {
        $addToSet: { enrolledStudents: studentId },
        $inc: { availableSeats: -1 },
      },
    ),
  ]);

  if (courseUpdate.matchedCount === 0) {
    const alreadyEnrolled = await Course.exists({
      _id: courseId,
      enrolledStudents: studentId,
    });
    if (!alreadyEnrolled) {
      console.error(
        `⚠️ Seat allocation failed for paid enrollment: student ${studentId}, course ${courseId}. Course may be oversold — needs manual review.`,
      );
    }
  }
}

const getAllPayments = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const payments = await Payment.find()
    .populate('student', 'name email phone')
    .populate('course', 'name price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: { payments },
  });
});

module.exports = {
  requestPayment,
  verifyPayment,
  getPaymentResult,
  getAllPayments,
};
