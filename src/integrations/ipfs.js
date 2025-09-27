const axios = require('axios');
const FormData = require('form-data');
const { pinataJwt } = require('../config/env');

async function pinBuffer(buffer, name = 'file') {
  if (!pinataJwt) throw new Error('PINATA_JWT not configured');
  const data = new FormData();
  data.append('file', buffer, { filename: name });
  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
    headers: {
      ...data.getHeaders(),
      Authorization: `Bearer ${pinataJwt}`,
    },
    maxBodyLength: Infinity,
  });
  return res.data.IpfsHash; // CID
}

async function pinJSON(json) {
  if (!pinataJwt) throw new Error('PINATA_JWT not configured');
  const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', json, {
    headers: { Authorization: `Bearer ${pinataJwt}` },
  });
  return res.data.IpfsHash;
}

module.exports = { pinBuffer, pinJSON };
