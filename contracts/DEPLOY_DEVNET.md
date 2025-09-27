# Deploy Sui Move modules to devnet

Prerequisites:
- Sui CLI installed and configured for devnet
- `sui client active-address` funded with devnet SUI

Steps:

1. Build packages
```
cd contracts
sui move build
```

2. Publish
```
sui client publish --gas-budget 100000000
```
Capture the published packageId and set it as SUI_PACKAGE_ID in `.env`.

3. Interact
- Use @mysten/sui.js in frontend to call `simple_escrow::create_escrow` and save returned object ID as trustlessSwapID in your Order.
- Verifier calls `verify_and_release` (or use backend helper to orchestrate).
