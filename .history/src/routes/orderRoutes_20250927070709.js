const router = require('express').Router();
const orderService = require('../services/orderServiceImpl');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.post('/', async (req, res) => {
  try {
    console.log('📦 Order creation request:', {
      userId: req.user?.id,
      body: req.body,
      vendorId: req.body.vendorId,
      items: req.body.items,
      meta: req.body.meta
    });
    const { vendorId, items, meta } = req.body;
    const out = await orderService.createOrder(req.user.id, vendorId, items, meta);
    console.log('✅ Order created successfully:', out._id);
    res.status(201).json(out);
  } catch (e) {
    console.error('❌ Order creation error:', e.message);
    res.status(400).json({ error: e.message });
  }
});

router.post('/:orderId/escrow', async (req, res) => {
  try {
    const out = await orderService.setEscrowId(req.params.orderId, req.body.escrowId);
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
