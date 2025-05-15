const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const coursesRoute = require('./routes/coursesRoute');
const userRoute = require('./routes/userRoute');
const newsRoute = require('./routes/newsRoute');
const studentWorkRoute = require('./routes/studentWorkRoute');

const app = express();

/// ✅ Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// ✅ Logger for development
app.use(morgan('dev'));

// ✅ Parse JSON request bodies
app.use(express.json());

// ✅ Parse URL-encoded form data (e.g. profilePicture uploads)
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files (like images) from /uploads path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Mount API Routes
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/users', userRoute); // includes signup/login/OTP routes
app.use('/api/v1/news', newsRoute);
app.use('/api/v1/studentWorks', studentWorkRoute);

module.exports = app;
