const router = require('express').Router();
const productService = require('../services/productServiceImpl');
const { authenticate, requireRole } = require('../middlewares/auth');

// Public list by vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try { const out = await productService.getVendorProducts(req.params.vendorId); res.json(out); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete product (vendor only)
router.delete('/:id', authenticate, requireRole('vendor'), async (req, res) => {
  try { const out = await productService.deleteProduct(req.params.id, req.user.id); res.json(out); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
