const { getFullnodeUrl, SuiClient, TransactionBlock } = require('@mysten/sui.js/client');
const { suiRpcUrl, suiPackageId } = require('../config/env');

function client() {
  const url = suiRpcUrl || getFullnodeUrl('testnet');
  return new SuiClient({ url });
}

// Build a create escrow transaction; the frontend wallet should sign & execute
async function buildCreateEscrowTx({ sender, vendor, verifier, amount, inputCoinType, outputCoinType, unlockKey }) {
  const tx = new TransactionBlock();
  // Pseudocode call; replace with actual module path & function names
  // tx.moveCall({
  //   target: `${suiPackageId}::simple_escrow::create_escrow`,
  //   typeArguments: [inputCoinType],
  //   arguments: [ tx.pure(sender), tx.pure(vendor), tx.pure(verifier), /* coin object */, tx.pure(amount), tx.pure(unlockKey) ],
  // });
  return tx;
}

async function releaseEscrow(escrowId) {
  // Server can only submit if it controls a key. For demo, we just check the object exists.
  const c = client();
  const obj = await c.getObject({ id: escrowId, options: { showContent: true } });
  if (!obj) throw new Error('Escrow not found');
  return true;
}

async function refundEscrow(escrowId) {
  const c = client();
  const obj = await c.getObject({ id: escrowId, options: { showContent: true } });
  if (!obj) throw new Error('Escrow not found');
  return true;
}

async function watchTx(digest) {
  const c = client();
  return c.waitForTransaction({ digest });
}

module.exports = { client, buildCreateEscrowTx, releaseEscrow, refundEscrow, watchTx };
