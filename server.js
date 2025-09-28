const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 🔒 Handle uncaught exceptions early
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
  process.exit(1);
});

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? './.env.test' : './config.env',
});

// ✅ Replace password in DB URI
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));

// ✅ Only start the server in non-test environments
let server;
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
}

// 🔒 Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'UNHANDLED REJECTION at:',
    promise,
    'reason:',
    reason && (reason.stack || reason)
  );
  // optionally shutdown server gracefully then exit
});
