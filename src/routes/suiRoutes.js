const router = require('express').Router();
const { suiRpcUrl, suiPackageId, logisticsPublicKey } = require('../config/env');

router.get('/config', (_req, res) => {
  res.json({ rpcUrl: suiRpcUrl, packageId: suiPackageId, logisticsPublicKey });
});

module.exports = router;
