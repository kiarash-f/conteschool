const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 🔒 Handle uncaught exceptions early
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// ✅ Dynamically use `.env` or `.env.test` based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? './.env.test' : './config.env',
});

// ✅ Replace password in DB URI
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// ✅ Connect to MongoDB
mongoose.connect(DB, {}).then(() => {
  console.log('DB connection successful!');
});

// ✅ Only start the server in non-test environments
let server;
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
}

// 🔒 Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 💥 Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
