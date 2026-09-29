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

const sendError = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.isOperational
      ? err.message
      : 'مشکلی در سرور پیش آمده است. لطفاً بعداً دوباره تلاش کنید.',
  });

  if (!err.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', err);
  }
};

module.exports = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendError(error, res);
};
