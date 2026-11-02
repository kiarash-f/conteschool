const rateLimit = require('express-rate-limit');
const AppError = require('./appError');

const MINUTE = 60 * 1000;

// Same phone string the login controller uses; '' means "not a usable phone".
const phoneOf = (req) =>
  req.body && typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

// The login endpoint does two jobs: no otp = send a code, otp = check a code.
const isSendCode = (req) => !req.body || !req.body.otp;
const isCheckCode = (req) => !isSendCode(req);

const build = ({ windowMs, limit, message, ...rest }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(message, 429)),
    ...rest,
  });

// Send a code: per phone number (protects the phone's owner and the SMS bill).
exports.sendCodePerPhone = build({
  windowMs: 10 * MINUTE,
  limit: 3,
  message: 'تعداد درخواست کد تایید زیاد است. لطفاً ۱۰ دقیقه دیگر دوباره تلاش کنید',
  skip: (req) => !isSendCode(req) || !phoneOf(req),
  keyGenerator: (req) => `send:${phoneOf(req)}`,
});

// Send a code: per IP, loose because many phones can share one mobile IP.
exports.sendCodePerIp = build({
  windowMs: 15 * MINUTE,
  limit: 30,
  message: 'درخواست‌های زیادی از این شبکه ارسال شده است. لطفاً چند دقیقه دیگر تلاش کنید',
  skip: (req) => !isSendCode(req),
});

// Check a code: only wrong guesses count (successful logins are skipped).
exports.checkCodePerPhone = build({
  windowMs: 10 * MINUTE,
  limit: 5,
  message: 'تعداد تلاش‌های ناموفق زیاد است. لطفاً ۱۰ دقیقه دیگر دوباره تلاش کنید',
  skipSuccessfulRequests: true,
  skip: (req) => !isCheckCode(req) || !phoneOf(req),
  keyGenerator: (req) => `check:${phoneOf(req)}`,
});

exports.checkCodePerIp = build({
  windowMs: 15 * MINUTE,
  limit: 30,
  message: 'درخواست‌های زیادی از این شبکه ارسال شده است. لطفاً چند دقیقه دیگر تلاش کنید',
  skipSuccessfulRequests: true,
  skip: (req) => !isCheckCode(req),
});

exports.signupPerIp = build({
  windowMs: 60 * MINUTE,
  limit: 20,
  message: 'تعداد ثبت‌نام‌ها از این شبکه زیاد است. لطفاً بعداً دوباره تلاش کنید',
});

exports.login = [
  exports.sendCodePerIp,
  exports.checkCodePerIp,
  exports.sendCodePerPhone,
  exports.checkCodePerPhone,
];
