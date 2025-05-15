const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `course-${Date.now()}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter
});

// Compression middleware
const compressImage = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const compressedFilename = `compressed-${req.file.filename}`;
  const outputPath = path.join(__dirname, '..', 'uploads', compressedFilename);

  try {
    await sharp(inputPath)
      .resize({ width: 800 }) // Optional: resize
      .jpeg({ quality: 80 }) // Compress
      .toFile(outputPath);

    fs.unlinkSync(inputPath); // Delete original

    req.file.filename = compressedFilename; // Update filename in request
    next();
  } catch (err) {
    console.error('Image compression error:', err);
    next(err);
  }
};

module.exports = {
  upload,
  compressImage
};
