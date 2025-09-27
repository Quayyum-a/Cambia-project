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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await demoEscrowService.uploadProof(vendorAddress, escrowId, proofHash);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verify and release
router.post('/:escrowId/verify', async (req, res) => {
  try {
    const { verifierAddress, unlockKey } = req.body;
    const { escrowId } = req.params;

    if (!verifierAddress || !unlockKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await demoEscrowService.verifyAndRelease(verifierAddress, escrowId, unlockKey);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel escrow
router.post('/:escrowId/cancel', async (req, res) => {
  try {
    const { senderAddress } = req.body;
    const { escrowId } = req.params;

    if (!senderAddress) {
      return res.status(400).json({ error: 'Missing sender address' });
    }

    const result = await demoEscrowService.cancelEscrow(senderAddress, escrowId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get escrow details
router.get('/:escrowId', (req, res) => {
  try {
    const { escrowId } = req.params;
    const escrow = demoEscrowService.getEscrow(escrowId);

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json(escrow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get escrows by address
router.get('/address/:address', (req, res) => {
  try {
    const { address } = req.params;
    const escrows = demoEscrowService.getEscrowsByAddress(address);
    res.json(escrows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get transaction history
router.get('/:escrowId/transactions', (req, res) => {
  try {
    const { escrowId } = req.params;
    const transactions = demoEscrowService.getTransactionHistory(escrowId);
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create demo scenario
router.post('/demo/create', (req, res) => {
  try {
    const demoData = demoEscrowService.createDemoScenario();
    res.json({
      message: 'Demo scenario created successfully',
      ...demoData
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset demo data
router.post('/demo/reset', (req, res) => {
  try {
    demoEscrowService.reset();
    res.json({ message: 'Demo data reset successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;