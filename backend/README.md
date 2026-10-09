# OASIS Resort Skardu - Node.js & MySQL Backend API

This is the backend REST API for **OASIS Resort Skardu**, built with **Node.js, Express, and MySQL**.

## 🛠️ Tech Stack
- **Node.js** (v18+)
- **Express.js** (REST API framework)
- **MySQL2** (High-performance connection pooling & prepared statements)
- **JWT (jsonwebtoken)** (Stateless secure authentication)
- **Bcryptjs** (Password hashing)
- **Multer** (File upload handler for bank deposit slips)

---

## 🚀 Getting Started

### 1. Requirements
- Ensure **MySQL server** is running (e.g. start MySQL in **XAMPP Control Panel** or local MySQL service on port 3306).
- Node.js (v18 or higher).

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` (already done by default) and check your MySQL credentials:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=oasis_resort
JWT_SECRET=oasis_resort_skardu_super_secret_jwt_key_2026
```

### 4. Database Setup & Seeding
The backend **automatically creates the database and tables on startup** if they do not exist!
To manually initialize or re-seed the database at any time, run:
```bash
npm run db:init
```

### 5. Start the Server
Development mode with auto-reload:
```bash
npm run dev
```
Production mode:
```bash
npm start
```

The API will be available at: `http://localhost:5000`

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Resort Admin** | `admin@oasisresort.pk` | `password123` |
| **Reception Desk** | `reception@oasisresort.pk` | `password123` |
| **Guest** | `guest@oasisresort.pk` | `password123` |

*Tip: Quick 1-click login is also supported via `GET /api/auth/quick-login/:role`*

---

## 📡 Key API Routes

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Guest registration
- `GET /api/auth/quick-login/:role` - 1-click demo login
- `GET /api/rooms` - Room accommodations catalog with dynamic seasonal pricing
- `GET /api/rooms/:slug` - Single room details, availability & recommendations
- `POST /api/bookings` - Create reservation with concurrency check
- `POST /api/bookings/validate-promo` - Validate promo code
- `GET /api/reception/dashboard` - Front desk arrivals, departures & in-house guests
- `POST /api/reception/walkin` - Walk-in front desk reservation
- `GET /api/guest/dashboard` - Guest stays, voucher, review submission
- `GET /api/admin/dashboard` - Central analytics and occupancy metrics
