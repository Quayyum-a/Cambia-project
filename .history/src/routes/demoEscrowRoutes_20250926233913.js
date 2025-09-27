const router = require('express').Router();
const demoEscrowService = require('../services/demoEscrowService');

// Create escrow
router.post('/create', async (req, res) => {
  try {
    const { senderAddress, vendorAddress, verifierAddress, amount, unlockKey } = req.body;

    if (!senderAddress || !vendorAddress || !verifierAddress || !amount || !unlockKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await demoEscrowService.createEscrow(
      senderAddress,
      vendorAddress,
      verifierAddress,
      Number(amount),
      unlockKey
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload proof
router.post('/:escrowId/proof', async (req, res) => {
  try {
    const { vendorAddress, proofHash } = req.body;
    const { escrowId } = req.params;

    if (!vendorAddress || !proofHash) {
