# THEPAINTEDOTS
# ≡ƒÄ¿ THE PAINTED DOTS
### An E-Commerce Platform for Handmade Mandala Art

<p align="center">
  A digital storefront dedicated to handmade mandala art, personalised designs, and creative craftsmanship.
</p>

---

## ≡ƒî╕ About The Project

**The Painted Dots** is a full-stack e-commerce project designed to showcase and sell handmade mandala art products.

The platform provides an interactive shopping experience where customers can explore handcrafted products, customise mandala designs, manage their shopping carts, save favourite products, and place orders.

The project combines a React-based frontend with a Node.js and Express backend, using MongoDB for database management.

## Γ£¿ Key Features

### ≡ƒ¢ì∩╕Å E-Commerce
- Product catalogue and product browsing
- Product details and categories
- Shopping cart management
- Wishlist functionality
- Checkout and order management
- Order tracking

### ≡ƒÄ¿ Custom Design Studio
- Personalised mandala product designs
- Custom shapes and colours
- Pattern selection
- Design personalisation options
- Custom design management

### ≡ƒæñ User Management
- User registration and login
- JWT-based authentication
- Password hashing
- Customer profile management

### Γ¡É Additional Features
- Product reviews and ratings
- Coupon and discount validation
- Customer contact enquiries
- Admin product management

## ≡ƒ¢á∩╕Å Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| Security | Helmet, CORS, Express Rate Limit |
| Logging | Morgan |

## ≡ƒôé Project Structure

```text
THE-PAINTED-DOTS/
Γöé
Γö£ΓöÇΓöÇ frontend/
Γöé   Γö£ΓöÇΓöÇ src/
Γöé   Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ views/
Γöé   Γöé   Γö£ΓöÇΓöÇ assets/
Γöé   Γöé   Γö£ΓöÇΓöÇ data/
Γöé   Γöé   Γö£ΓöÇΓöÇ App.tsx
Γöé   Γöé   ΓööΓöÇΓöÇ main.tsx
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ index.html
Γöé   Γö£ΓöÇΓöÇ package.json
Γöé   Γö£ΓöÇΓöÇ vite.config.ts
Γöé   ΓööΓöÇΓöÇ README.md
Γöé
Γö£ΓöÇΓöÇ backend/
Γöé   Γö£ΓöÇΓöÇ config/
Γöé   Γö£ΓöÇΓöÇ controllers/
Γöé   Γö£ΓöÇΓöÇ models/
Γöé   Γö£ΓöÇΓöÇ routes/
Γöé   Γö£ΓöÇΓöÇ middleware/
Γöé   Γö£ΓöÇΓöÇ utils/
Γöé   Γö£ΓöÇΓöÇ seed/
Γöé   Γö£ΓöÇΓöÇ public/
Γöé   Γö£ΓöÇΓöÇ server.js
Γöé   Γö£ΓöÇΓöÇ package.json
Γöé   ΓööΓöÇΓöÇ README.md
Γöé
ΓööΓöÇΓöÇ README.md
```

## ≡ƒùä∩╕Å Database Design

The application uses MongoDB as its database and Mongoose for schema management.

The backend contains eight primary models:

| Model | Description |
|---|---|
| User | Customer and administrator information |
| Product | Handmade product information |
| Cart | Shopping cart information |
| Order | Customer order records |
| Review | Product ratings and feedback |
| Coupon | Discount and coupon information |
| CustomDesign | Personalised mandala designs |
| ContactMessage | Customer enquiries |

## ΓÜÖ∩╕Å Installation and Setup

### Prerequisites

- Node.js 18 or above
- npm
- MongoDB local installation or MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/the-painted-dots.git
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs at:

`http://localhost:3000`

### 3. Backend Setup

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the following variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=30d
CLIENT_ORIGIN=http://localhost:5173
ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_secure_admin_password
```

### 4. Seed the Database

```bash
npm run seed
```

This script populates the database with sample products, coupons and an administrator account.

### 5. Start the Backend

```bash
npm run dev
```

The backend API runs at:

`http://localhost:5000`

Health check endpoint:

`http://localhost:5000/api/health`

## ≡ƒöù Backend API Modules

| Module | Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Products | `/api/products` |
| Reviews | `/api/reviews` |
| Wishlist | `/api/wishlist` |
| Cart | `/api/cart` |
| Custom Designs | `/api/designs` |
| Orders | `/api/orders` |
| Coupons | `/api/coupons` |
| Contact | `/api/contact` |

## ≡ƒöÉ Security

- Password hashing using bcryptjs
- JWT-based authentication
- Protected routes for authorised users
- Helmet security middleware
- CORS configuration
- API rate limiting
- Environment variables for sensitive credentials

## ≡ƒÄ» Project Objectives

1. Develop an interactive e-commerce platform for handmade mandala products.
2. Implement structured database management using MongoDB.
3. Demonstrate CRUD operations and database querying.
4. Implement secure user authentication.
5. Develop product, cart, wishlist and order management modules.
6. Provide custom product design functionality.
7. Demonstrate full-stack web development concepts.

## ≡ƒÜÇ Future Enhancements

- Integration of a secure online payment gateway.
- Email notifications for orders and enquiries.
- Live inventory management.
- Enhanced order tracking.
- Deployment of the frontend and backend.
- Complete frontend-to-backend API integration.

## ≡ƒæ⌐ΓÇì≡ƒÆ╗ Development Team

**The Painted Dots Development Team**

| Team Member | Role |
|---|---|
| [Member 1] | [Contribution] |
| [Member 2] | [Contribution] |
| [Member 3] | [Contribution] |
| [Member 4] | [Contribution] |

## ≡ƒÄô Academic Project

Developed as part of the **Database Management Systems (DBMS) Mini Project** at PES University, Department of Computer Science and Engineering.

**Course:** UE23CS351A ΓÇô DBMS Project  
**Academic Period:** August ΓÇô December 2026

---

<p align="center">
  Made with Γ¥ñ∩╕Å and creativity by The Painted Dots Team
</p>
