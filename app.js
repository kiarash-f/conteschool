const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

const coursesRoute = require('./routes/coursesRoute');
const userRoute = require('./routes/userRoute');
const newsRoute = require('./routes/newsRoute');
const studentWorkRoute = require('./routes/studentWorkRoute');
const reviewRoute = require('./routes/reviewRoute');
const paymentRoutes = require('./routes/paymentRoutes');
const health = require('./routes/health');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const app = express();

/// ✅ Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://conteschool.ir',
  'https://www.conteschool.ir',
  'https://contevisualschool.liara.run',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// ✅ Enable Gzip compression
app.use(compression());
app.set('trust proxy', 1);
app.use(helmet());

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

app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/news', newsRoute);
app.use('/api/v1/studentWorks', studentWorkRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api', health);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

module.exports = app;
