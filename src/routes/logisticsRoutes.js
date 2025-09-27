const router = require('express').Router();
const orderService = require('../services/orderServiceImpl');
const { logisticsPublicKey } = require('../config/env');

// For demo, allow passing pubkey or use env
router.post('/verify', async (req, res) => {
  try {
    const { orderId, payload, signature, publicKey } = req.body;
    const pub = publicKey || logisticsPublicKey;
    if (!pub) return res.status(400).json({ error: 'Missing logistics public key' });
    const out = await orderService.verifyAndRelease(orderId, pub, payload, signature);
    res.json(out);
  } catch (e) { res.status(e.status || 400).json({ error: e.message }); }
});

module.exports = router;
