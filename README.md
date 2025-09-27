# Cambia Backend and Contracts

Backend for Cambia — a Sui-powered diaspora remittance + Nigerian foodstuff marketplace. Includes MongoDB models/services, Sui Move contracts (escrow), and API for vendor/order flows.

## Run locally

- Requirements: Node 18+
- Env: create a `.env` with:
  - JWT_SECRET=dev
  - USE_SUPABASE=true
  - SUPABASE_URL=<your_supabase_project_url>
  - SUPABASE_ANON_KEY=<your_supabase_anon_key> (frontend-safe)
  - SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key> (backend only)
  - SUI_RPC_URL=https://fullnode.testnet.sui.io:443
  - SUI_PACKAGE_ID=<deployed_package_id>
  - LOGISTICS_PUBKEY=<base64_ed25519_pubkey>
  - PINATA_JWT=<pinata_jwt>

Optional (legacy Mongo paths kept for backward compatibility during migration):
  - MONGODB_URI=mongodb://localhost:27017/cambia
  - MONGODB_TEST_URI=mongodb://localhost:27017/cambia_test

Supabase schema (SQL):
```
-- roles
create type user_role as enum ('sender','vendor','logistics','admin');

-- users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text unique not null,
  password_hash text,
  role user_role not null,
  created_at timestamptz default now()
);

-- products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  unit text not null,
  quantity_available integer not null default 0,
  created_at timestamptz default now()
);

-- orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete set null,
  vendor_id uuid references users(id) on delete set null,
  status text not null default 'pending',
  total_price numeric not null default 0,
  trustless_swap_id text,
  proof_of_packaging text,
  created_at timestamptz default now()
);

-- order_items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  price numeric not null,
  quantity integer not null
);
```

Install deps and start:

```
npm install
node src/app.js
```

## Tests

```
npm test
```

## Key API endpoints

- POST /api/auth/register
- POST /api/auth/login
- POST /api/vendor/products (vendor)
- PATCH /api/vendor/products/:id/stock (vendor)
- PATCH /api/vendor/products/:id/price (vendor)
- GET /api/vendor/products (vendor)
- POST /api/orders (sender)
- POST /api/orders/:orderId/escrow (sender)
- POST /api/vendor/orders/:orderId/receive (vendor)
- POST /api/vendor/orders/:orderId/prepare (vendor)
- POST /api/vendor/orders/:orderId/proof (vendor)
- POST /api/logistics/verify (logistics)

## Sui integration

See `contracts/sources` for Move modules. Frontend should build and sign create_escrow transactions with @mysten/sui.js; backend provides verification and release orchestration. See `src/sui/suiIntegration.js` for examples.
