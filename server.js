// server.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// 🔒 Handle uncaught exceptions early (sync errors)
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err.stack || err);
  process.exit(1);
});

// ✅ Load environment variables

const envFile = process.env.NODE_ENV === 'test' ? './.env.test' : './.env';
dotenv.config({ path: envFile });

console.log(`🧩 Environment loaded from: ${envFile}`);
console.log(`🚀 NODE_ENV: ${process.env.NODE_ENV}`);

// ✅ Connect to MongoDB
const DB = process.env.DATABASE;

if (!DB) {
  console.error('❌ DATABASE connection string is missing in .env');
  process.exit(1);
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connection established successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  });

// ✅ Start server
let server;
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  server = app.listen(port, () => {
    console.log(`🌐 App running on port ${port}...`);
  });
}

// 🔒 Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', (reason, promise) => {
  console.error(
    '💥 UNHANDLED REJECTION at:',
    promise,
    '\nreason:',
    reason && (reason.stack || reason)
  );

  if (server) {
    server.close(() => {
      console.log('🧹 Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
