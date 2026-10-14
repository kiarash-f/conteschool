const router = require('express').Router();
const mongoose = require('mongoose');

const REQUIRED_ENV = [
  'DATABASE',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MESSAGEWAY_API_KEY',
  'ZARINPAL_MERCHANT_ID',
  'ZARINPAL_CALLBACK_URL',
  'FRONT_URL',
];

router.get('/health', (req, res) =>
  res.status(200).json({ ok: true, ts: Date.now() }),
);

router.get('/health/deep', (req, res) => {
  const db = mongoose.connection.readyState === 1;
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  const ok = db && missing.length === 0;
  if (!ok) {
    console.error(
      `Deep health check failing: db=${db} missingEnv=${missing.join(',') || 'none'}`,
    );
  }
  res.status(ok ? 200 : 503).json({ ok, ts: Date.now() });
});

module.exports = router;
