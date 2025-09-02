# Project Repository

This repository contains a fullstack online shopping platform.

Backend (Express)
- Location: express_backend
- Features: Product catalog, search, cart, authentication (JWT), checkout and mock payments, order tracking
- Docs: visit /docs while server is running

Running locally
1) Copy env file
   cp express_backend/.env.example express_backend/.env
   # Update values appropriately (PostgreSQL, JWT secret, etc.)

2) Install and start backend
   cd express_backend
   npm install
   npm run dev

Environment variables required (see .env.example)
- DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
- JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS
- PORT, HOST

API Overview
- GET / (health)
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /products (supports q, category, minPrice, maxPrice, limit, offset)
- GET /products/:id
- POST /products (admin only)
- PUT /products/:id (admin only)
- DELETE /products/:id (admin only)
- GET /cart
- POST /cart (productId, quantity)
- PUT /cart (productId, quantity)
- DELETE /cart/item/:productId
- DELETE /cart/clear
- POST /orders/checkout
- GET /orders
- GET /orders/:id