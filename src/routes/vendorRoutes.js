const router = require('express').Router();
const vendorService = require('../services/vendorServiceImpl');
const { authenticate, requireRole } = require('../middlewares/auth');
const multer = require('multer');
const { pinBuffer } = require('../integrations/ipfs');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate, requireRole('vendor'));

// Products
router.post('/products', async (req, res) => {
  try {
    const product = await vendorService.addProduct(req.user.id, req.body);
    res.status(201).json(product);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const out = await vendorService.updateProductStock(req.user.id, req.params.id, Number(req.body.quantity));
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.patch('/products/:id/price', async (req, res) => {
  try {
    const out = await vendorService.updateProductPrice(req.user.id, req.params.id, Number(req.body.price));
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/products', async (req, res) => {
  try {
    const out = await vendorService.getVendorProducts(req.user.id);
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Order ops
router.post('/orders/:orderId/receive', async (req, res) => {
  try { const out = await vendorService.receiveOrder(req.user.id, req.params.orderId); res.json(out); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/orders/:orderId/prepare', async (req, res) => {
  try { const out = await vendorService.prepareGoods(req.user.id, req.params.orderId); res.json(out); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/orders/:orderId/proof', async (req, res) => {
  try { const out = await vendorService.uploadProof(req.user.id, req.params.orderId, req.body.proofCid); res.json(out); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/orders/:orderId/proof/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const cid = await pinBuffer(req.file.buffer, req.file.originalname);
    const out = await vendorService.uploadProof(req.user.id, req.params.orderId, cid);
    res.json(out);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
