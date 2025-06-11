const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const coursesRoute = require('./routes/coursesRoute');
const userRoute = require('./routes/userRoute');
const newsRoute = require('./routes/newsRoute');
const studentWorkRoute = require('./routes/studentWorkRoute');
const sitemapRoutes = require('./routes/sitemapRoutes');
const reviewRoute = require('./routes/reviewRoute');

const app = express();

/// ✅ Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
// ✅ Enable Gzip compression
app.use(compression());

// ✅ Logger for development
app.use(morgan('dev'));

// ✅ Parse JSON request bodies
app.use(express.json());

// ✅ Parse URL-encoded form data 
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files  from /uploads path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve static files from the public directory
app.use(express.static('public'));

// ✅ Mount API Routes
app.use('/', sitemapRoutes);
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/users', userRoute); 
app.use('/api/v1/news', newsRoute);
app.use('/api/v1/studentWorks', studentWorkRoute);
app.use('/api/v1/reviews', reviewRoute);


module.exports = app;
