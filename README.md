# 🎨 THE PAINTED DOTS
### E-Commerce Platform for Handmade Mandala Art

The Painted Dots is a full-stack e-commerce project showcasing handmade mandala art, personalised designs, and creative craftsmanship.

## 🌸 Project Overview

The platform provides an interactive shopping experience where customers can explore handcrafted products, browse categories, manage shopping carts, and place orders.

The project combines a React frontend with a Node.js and Express backend, using MySQL for relational database management and Redis for caching and temporary cart storage.

## ✨ Key Features

- Product catalogue and product browsing
- Product details and categories
- Shopping cart and checkout
- User registration and login
- JWT-based authentication
- Password hashing
- Order placement and order history
- Admin product and stock management
- Redis-based cart storage and product caching
- MySQL transactions and inventory management
- DBMS reporting views, stored procedures and triggers

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Relational Database | MySQL 8 |
| NoSQL / Key-Value Store | Redis |
| Authentication | JWT, bcryptjs |
| Security | Helmet, CORS, Express Rate Limit |
| Logging | Morgan |

## 📂 Repository Structure

```text
THEPAINTEDOTS/
│
├── README.md
├── thepainteddots-frontend-main.zip
└── Painted_Dots_Backend.zip
```

The backend ZIP contains the backend source code, SQL scripts, DBMS screenshots, ER diagram, configuration examples and documentation.

## 🗄️ Database Management

The MySQL database demonstrates:

- Primary keys and foreign keys
- UNIQUE and CHECK constraints
- Indexes and full-text indexing
- SQL joins and aggregate queries
- Stored procedures
- Triggers
- Views
- Transactions and rollback
- Order management and inventory control

Redis demonstrates:

- Key-value storage
- Temporary shopping cart persistence
- Product response caching
- Cache expiry and invalidation

## 💻 Running the Frontend

1. Extract `thepainteddots-frontend-main.zip`.
2. Open the extracted frontend folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Start the frontend development server:

```bash
npm run dev
```

5. Open the local URL displayed in your terminal (usually `http://localhost:5173`).

The frontend runs independently from the backend.

## 🔗 Running the Complete Application

To run the complete application:

- Start the MySQL database.
- Start the Redis server.
- Start the backend API using the backend setup instructions.
- Start the frontend using the frontend setup instructions.

The frontend and backend run in separate terminals.

## ⚙️ Running the Backend

1. Extract `Painted_Dots_Backend.zip`.
2. Open the extracted backend folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env` and configure your environment variables.
5. Start MySQL and Redis.
6. Execute `sql/schema.sql` using MySQL Workbench or the MySQL command line.
7. Seed sample products:

```bash
npm run seed
```

8. Start the backend:

```bash
npm run dev
```

The API runs at:

`http://localhost:4000`

Health check:

`http://localhost:4000/api/health`

## 🔗 Backend API Modules

| Module | Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Products | `/api/products` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Admin Analytics | `/api/admin/analytics` |

## 🔐 Security

- Password hashing using bcryptjs
- JWT-based authentication
- Protected API routes
- Helmet security middleware
- CORS configuration
- API rate limiting
- Environment variables for sensitive credentials

## 🚀 Future Enhancements

- Complete frontend-to-backend API integration
- Online payment gateway
- Email notifications
- Enhanced order tracking
- Additional custom design and review API functionality

## 🎓 Academic Project

Developed as part of the Database Management Systems (DBMS) Mini Project at PES University, Department of Computer Science and Engineering.

**Course:** UE23CS351A – DBMS Project  
**Academic Period:** August – December 2026

## 👩‍💻 Development Team

The Painted Dots Development Team