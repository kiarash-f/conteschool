const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer upload instance WITHOUT fileFilter
const upload = multer({ storage: storage });

exports.courseUpload = upload.fields([
  { name: 'Image', maxCount: 1 }, 
  { name: 'courseImages', maxCount: 10 }, 
]);
