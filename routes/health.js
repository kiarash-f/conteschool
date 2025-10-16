const router = require('express').Router();
router.get('/health', (req, res) =>
  res.status(200).json({ ok: true, ts: Date.now() })
);
module.exports = router;
