const AppError = require('../utils/appError');

const handleCastErrorDB = (err) =>
  new AppError(`مقدار نامعتبر برای ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  return new AppError(
    `مقدار تکراری برای ${field}. لطفاً مقدار دیگری وارد کنید`,
    400,
  );
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`داده نامعتبر: ${messages.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('توکن نامعتبر است. لطفاً دوباره وارد شوید.', 401);

const handleJWTExpiredError = () =>
  new AppError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.', 401);

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return new AppError('حجم هر تصویر نباید بیشتر از ۲۰ مگابایت باشد', 400);
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT')
    return new AppError('تعداد یا نام فایل‌های ارسالی معتبر نیست', 400);
  return new AppError('ارسال فایل نامعتبر است', 400);
};

const logError = (err, req) => {
  const where = `${req.method} ${req.originalUrl.split('?')[0].slice(0, 200)}`;
  const who = req.user ? String(req.user._id) : '-';
  const msg = String(err.message).slice(0, 300);
  if (err.isOperational) {
    console.warn(`⚠️ ${where} -> ${err.statusCode} uid=${who} | ${msg}`);
  } else {
    console.error(
      `💥 UNEXPECTED ERROR ${where} uid=${who} | ${msg}\n`,
      err.stack || err,
    );
  }
};

const sendError = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.isOperational
      ? err.message
      : 'مشکلی در سرور پیش آمده است. لطفاً بعداً دوباره تلاش کنید.',
  });
};

module.exports = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(err);

  logError(error, req);
  sendError(error, res);
};
