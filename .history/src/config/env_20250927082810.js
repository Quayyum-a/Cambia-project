require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  suiNetwork: process.env.SUI_NETWORK || 'testnet',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  suiRpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  suiPackageId: process.env.SUI_PACKAGE_ID || '',
  logisticsPublicKey: process.env.LOGISTICS_PUBKEY || '',
  pinataJwt: process.env.PINATA_JWT || ''
};
