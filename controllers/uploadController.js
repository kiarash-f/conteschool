const multer = require('multer');
const AppError = require('../utils/appError');

// Only these image types are accepted. The saved file extension comes from
// the checked type, never from the client's file name.
const ALLOWED_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB per image

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ALLOWED_TYPES.get(file.mimetype));
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
  cb(new AppError('فقط تصاویر JPG، PNG یا WebP پذیرفته می‌شود', 400));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 21 },
});

exports.imageUpload = upload.fields([
  { name: 'Image', maxCount: 1 },
  { name: 'courseImages', maxCount: 10 },
  { name: 'newsImages', maxCount: 10 },
]);
