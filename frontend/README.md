# OASIS Resort Skardu - React.js Frontend

This is the luxury frontend application for **OASIS Resort Skardu**, built with **React.js, Vite, and Tailwind CSS**.

## 🎨 Design Theme & Architecture
- **King's Hideaway Alpine-Desert Eco-Luxury**: Rich dark tones (`#121813`, `#1A221B`), sage green (`#6D7C5D`), desert sand gold (`#C5A880`), and warm ivory typography (`#EAEBE8`).
- **Typography**: Cormorant Garamond (display headers), Playfair Display (script accents), Plus Jakarta Sans (interface).
- **Glassmorphism**: Translucent pill badges, frosted glass panels, arched luxury window motifs.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The frontend will start at: `http://localhost:5173`

*(Note: API calls to `/api` and file uploads to `/uploads` are automatically proxied to the Node.js backend on `http://localhost:5000` via `vite.config.js`)*

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js             # Centralized fetch wrapper with JWT token handling
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state, login, quick demo login & logout
│   ├── components/
│   │   ├── QuickDemoBar.jsx      # Top bar with 1-click test role logins (Admin, Reception, Guest)
│   │   ├── Navbar.jsx            # Responsive navigation & account menu
│   │   ├── Footer.jsx            # Luxury footer with resort details & links
│   │   ├── RoomCard.jsx          # Reusable accommodations showcase card
│   │   └── StatusBadge.jsx       # Visual status badges for reservations & payments
│   ├── pages/
│   │   ├── Home.jsx              # Hero, quick search widget, villas, experiences, reviews
│   │   ├── RoomsIndex.jsx        # Accommodations catalog with category & capacity filters
│   │   ├── RoomDetail.jsx        # Room photo gallery, virtual tour, seasonal rates & calculator
│   │   ├── BookingFunnel.jsx     # Multi-step checkout with add-ons & promo codes
│   │   ├── BookingConfirmation.jsx # Printable luxury voucher reference
│   │   ├── Dining.jsx            # Indus riverside dining & Balti recipes
│   │   ├── Experiences.jsx       # Katpana 4x4 dune bashing, safaris & spa passes
│   │   ├── Gallery.jsx           # High-resolution categorized photo showcase
│   │   ├── Offers.jsx            # Exclusive promo packages with 1-click copy code
│   │   ├── BlogIndex.jsx         # Travel itineraries & packing guides
│   │   ├── BlogShow.jsx          # Individual travel journal story
│   │   ├── About.jsx             # Cold desert story, leadership team & testimonials
│   │   ├── Faqs.jsx              # Categorized questions & policies with keyword search
│   │   ├── Contact.jsx           # Front desk inquiry dispatch form
│   │   ├── AuthLogin.jsx         # Sign in with instant 1-click demo role switches
│   │   ├── AuthRegister.jsx      # Guest account creation
│   │   ├── GuestDashboard.jsx    # Guest portal: reservations, voucher, slip upload & verified review
│   │   ├── ReceptionDashboard.jsx # Mobile-first front desk: arrivals, departures, walk-in reservations
│   │   └── AdminDashboard.jsx    # Executive dashboard: KPIs, room active toggle, seasonal rates & CMS
│   ├── App.jsx                   # Central router & protected route guards
│   ├── main.jsx                  # React DOM root entry
│   └── index.css                 # Tailwind CSS & custom design tokens
├── index.html
├── vite.config.js
└── package.json
```
