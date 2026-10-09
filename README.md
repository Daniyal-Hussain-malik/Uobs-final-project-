# 🏔️ OASIS Resort Katpana, Skardu

A full-stack luxury hospitality & reservation web application for **OASIS Resort Katpana (Skardu, Gilgit-Baltistan)** built with **React.js**, **Node.js (Express)**, and **MySQL**.

---

## 🏗️ Architecture Overview

The codebase is split into two cleanly separated folders for optimal team collaboration:

```
OASIS Resort Skardu/
├── backend/                  # Node.js & Express REST API + MySQL database
│   ├── config/               # Database connection pool & auto-migration
│   ├── database/             # schema.sql
│   ├── middleware/           # JWT auth & role authorization guards
│   ├── routes/               # Modular Express REST API routes
│   │   ├── auth.routes.js
│   │   ├── rooms.routes.js
│   │   ├── bookings.routes.js
│   │   ├── public.routes.js
│   │   ├── guest.routes.js
│   │   ├── reception.routes.js
│   │   └── admin.routes.js
│   ├── scripts/              # init-db.js (auto-seeds MySQL tables)
│   ├── server.js             # Express application entry point
│   ├── .env                  # Backend database & port settings
│   └── package.json
│
├── frontend/                 # React.js (Vite + Tailwind CSS + Lucide React)
│   ├── src/
│   │   ├── api/client.js     # API client with JWT header injection
│   │   ├── context/          # AuthContext (persistent login & demo switcher)
│   │   ├── components/       # QuickDemoBar, Navbar, Footer, RoomCard, Badges
│   │   ├── pages/            # Public pages, multi-step booking funnel & dashboards
│   │   ├── App.jsx           # Client-side router & protected routes
│   │   └── index.css         # Luxury alpine-desert design system
│   ├── vite.config.js        # Vite dev server with proxy to backend
│   └── package.json
│
└── package.json              # Root workspace runner scripts
```

---

## ⚡ Quick Start Guide for Teammates

### Step 1: Start MySQL Server
Ensure your local **MySQL Server** is running (e.g. start MySQL in **XAMPP Control Panel** or local MySQL Windows service on port `3306`).

### Step 2: Configure Backend Environment
Check `backend/.env` (default is already configured for standard local MySQL/XAMPP):
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=oasis_resort
JWT_SECRET=oasis_resort_skardu_super_secret_jwt_key_2026
```

### Step 3: Initialize Database (Tables & Demo Seed Data)
The backend automatically creates the `oasis_resort` database and seeds demo data on its first start!
You can also run the initializer manually at any time:
```bash
npm run db:init
```

### Step 4: Run the Backend API
In a terminal:
```bash
npm run dev:backend
```
*(Runs on `http://localhost:5000`)*

### Step 5: Run the React Frontend
In a second terminal:
```bash
npm run dev:frontend
```
*(Runs on `http://localhost:5173`)*

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Logins & Instant Role Switching

For testing convenience, the application includes a **1-Click Demo Bar** at the top of every page and in the login screen:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Resort Admin** | `admin@oasisresort.pk` | `password123` | `/admin` (Analytics, Inventory, CMS, Reviews) |
| **Reception Desk** | `reception@oasisresort.pk` | `password123` | `/reception` (Mobile Front Desk, Check-in, Walk-ins) |
| **Guest** | `guest@oasisresort.pk` | `password123` | `/guest` (My Stays, Vouchers, Receipt Slips, Reviews) |

---

## 🌟 Key Application Features

1. **Multi-Step Booking Funnel (`/book`)**:
   - Live availability checks & seasonal price calculation.
   - Experiential Add-on selections (4x4 Dune Bashing, Riverside Balti dining, Jet ski passes, Spa).
   - Promo codes with instant discount deduction (`OASISWELCOME`, `HONEYMOON2026`).
   - Payment methods: JazzCash, Easypaisa, Direct Bank Transfer (with deposit slip upload), Pay at Hotel.
   - Printable luxury reservation voucher reference.
2. **Dynamic Seasonal Pricing**:
   - Automatic price overrides for Peak Summer Season, Cherry Blossom Festival, and Autumn Golden Foliage.
3. **Mobile-First Reception Desk (`/reception`)**:
   - Filter today's arrivals and departures.
   - One-click Check-in / Check-out status updates.
   - Bank receipt slip verification.
   - Rapid walk-in reservation modal.
4. **Verified Guest Reviews**:
   - Guests can only submit reviews after completing their stay.
   - Admin moderation toggle.
5. **Brand Aesthetic**:
   - King's Hideaway alpine luxury styling with dark obsidian forest backgrounds (`#121813`), desert sand gold accents (`#C5A880`), and sage green (`#6D7C5D`).
