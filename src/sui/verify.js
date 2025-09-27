const { Ed25519PublicKey } = require('@mysten/sui.js/cryptography');

async function verifyMessage(publicKeyBase64, payload, signatureBase64) {
  try {
    const pub = new Ed25519PublicKey(Buffer.from(publicKeyBase64, 'base64'));
    const msg = Buffer.isBuffer(payload) ? payload : Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload));
    const sig = Buffer.from(signatureBase64, 'base64');
    return pub.verify(msg, sig);
  } catch (e) {
    return false;
  }
}

module.exports = { verifyMessage };
