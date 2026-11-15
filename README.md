# Painted Dots — MySQL + Redis Backend Starter

This is a backend starter for the existing Painted Dots React + TypeScript + Vite frontend. It uses **Express API routes**, **MySQL** for persistent relational data, and **Redis** for temporary cart storage and product caching.

> **Course requirement note:** the DBMS brief provided by the student specifies Next.js for the web interface and MySQL/PostgreSQL plus a NoSQL or vector database. Redis is a key-value store and may or may not be accepted by the instructor as the required second database paradigm. Get explicit approval for MySQL + Redis before finalising the submission. This starter is Express + Vite compatible; it is not a Next.js migration.

## Included

- `sql/schema.sql`: MySQL schema, constraints, foreign keys, indexes, full-text index, status-history trigger, reporting views, and stored procedure.
- `src/routes/auth.js`: customer registration, login and current-user endpoint; passwords are bcrypt-hashed.
- `src/routes/products.js`: product listing/search/filter/sort, product detail, admin create product and stock update.
- `src/routes/cart.js`: per-user temporary cart in Redis with a 7-day expiry.
- `src/routes/orders.js`: transactional checkout, stock locking/decrement, order history and admin status updates.
- `src/routes/admin.js`: basic sales, top-products, low-stock and pending-orders analytics.
- `src/seed.js`: inserts a small sample catalogue based on the supplied Painted Dots frontend.

## Prerequisites

- Node.js 20 or newer
- MySQL 8.x running locally
- Redis 6 or newer running locally (Redis Stack is not required)

## Setup (Windows-friendly)

1. Extract this ZIP to a folder such as `painted-dots-backend`.
2. Open a terminal in that folder and run:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`. Set your MySQL password/database settings and replace `JWT_SECRET` with a long random secret. Never commit `.env` to GitHub.
4. Start MySQL and Redis.
5. Create the schema by running `sql/schema.sql` in MySQL Workbench or by using the MySQL command line:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
   If using Workbench, open the SQL file and execute it. The script creates/selects `painted_dots`.
6. Seed sample products:
   ```bash
   npm run seed
   ```
   Redis must be running because the seed script also verifies the Redis connection.
7. Create an admin account from the backend folder. In PowerShell:
   ```powershell
   $env:ADMIN_EMAIL="admin@painteddots.local"
   $env:ADMIN_PASSWORD="Choose-A-Long-Unique-Password"
   npm run create-admin
   ```
   On macOS/Linux:
   ```bash
   ADMIN_EMAIL=admin@painteddots.local ADMIN_PASSWORD='Choose-A-Long-Unique-Password' npm run create-admin
   ```
   Add the `create-admin` script to `package.json` if not already present: `"create-admin": "node src/create-admin.js"`.
8. Start the API:
   ```bash
   npm run dev
   ```
9. Open `http://localhost:4000/api/health`. Expected response includes MySQL connected and Redis PONG.

## Environment configuration

The frontend in the supplied ZIP runs on `http://localhost:3000`. `.env.example` uses that as `FRONTEND_ORIGIN`. If you run Vite on a different port, update it.

## API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Check MySQL + Redis |
| POST | `/api/auth/register` | No | Register a customer |
| POST | `/api/auth/login` | No | Login; returns a bearer token |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/products?q=mandala&category=Coasters&sort=price_asc` | No | Search/list products; Redis cache |
| GET | `/api/products/:id` | No | Product details |
| POST | `/api/products` | Admin bearer | Create product |
| PATCH | `/api/products/:id/stock` | Admin bearer | Update stock |
| GET/PUT/DELETE | `/api/cart` | Bearer | Read/save/clear temporary Redis cart |
| POST | `/api/orders` | Bearer | Place an order transactionally |
| GET | `/api/orders` | Bearer | Current user's orders |
| GET | `/api/orders/:id` | Bearer | Own order detail + status history |
| PATCH | `/api/orders/:id/status` | Admin bearer | Update status; trigger logs status history |
| GET | `/api/admin/analytics` | Admin bearer | Sales, top products, low stock, pending orders |

### Example: register

`POST http://localhost:4000/api/auth/register`
```json
{"name":"Demo Customer","email":"customer@example.com","password":"A-Strong-Password-123"}
```

### Example: login

`POST http://localhost:4000/api/auth/login`
```json
{"email":"customer@example.com","password":"A-Strong-Password-123"}
```

Use the returned token in later requests:
`Authorization: Bearer YOUR_TOKEN_HERE`

### Example: place an order

`POST http://localhost:4000/api/orders`
```json
{
  "items": [{"productId": 1, "quantity": 2}],
  "shipping": {
    "fullName": "Demo Customer",
    "phone": "9000000000",
    "addressLine": "12 Example Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "paymentMethod": "COD"
}
```
The server calculates prices from MySQL and does not trust a price/total sent by the browser. Stock is checked under row locks and order creation plus stock decrement run in one MySQL transaction.

## Connect the existing Vite frontend

The frontend currently uses local React state and sample product data. This backend does **not** automatically replace all frontend state; connect screens incrementally.

For example, add `VITE_API_BASE_URL=http://localhost:4000` to the frontend's `.env` and use:
```ts
const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
const response = await fetch(`${API}/api/products`);
if (!response.ok) throw new Error('Could not load products');
const data = await response.json();
console.log(data.products);
```
For protected routes, add `Authorization: Bearer ${token}`. Do not put database credentials or the JWT signing secret in the frontend environment.

## Redis concepts demonstrated

- Product response caching with a configurable TTL (`CACHE_TTL_SECONDS`).
- Cache invalidation when an admin creates a product or updates stock and after an order.
- User-specific temporary cart keys (`cart:user:<id>`) with a 7-day expiry.

MySQL remains the source of truth for prices, inventory and orders. Redis cart data is temporary and should be revalidated during checkout.

## DBMS concepts demonstrated

- Primary/foreign keys, UNIQUE and CHECK constraints
- `CREATE TABLE`, indexes and full-text indexing
- Transaction and row locking in order placement
- Trigger that logs order-status changes
- Views for monthly sales and low-stock products
- Stored procedure for top-selling products
- JOINs, GROUP BY and aggregation in admin analytics
- Redis key-value operations, expiry, cache hits/misses and invalidation

## Important limitations / next steps

This is a **starter backend**, not a finished integration. The frontend still needs to be wired to these endpoints; the sample catalogue is only a small subset of the frontend catalogue. Add tests, review the API security, and confirm whether Redis satisfies the second-database requirement. Custom design documents and reviews are not yet implemented as API routes. The sample checkout currently supports catalogue products, not custom design line items. Real payment processing is intentionally not included.
