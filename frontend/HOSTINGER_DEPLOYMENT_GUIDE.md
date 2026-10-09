# 🏔️ OASIS RESORT SKARDU — HOSTINGER DEPLOYMENT GUIDE

This guide explains how to connect and deploy your project on Hostinger using Git Auto-Deployment.

---

## 🚀 METHOD 1: All-In-One Node.js Deployment (RECOMMENDED)
Deploying via Hostinger **Node.js Application** from the Backend repository (`Oasis-Resort.git`).  
Since the backend already contains the pre-compiled frontend in its `public/` directory, this method serves both the **React Frontend Website** and **Express REST APIs** under **one single domain** with **zero CORS issues**.

### Step 1: Create MySQL Database on Hostinger
1. Log in to **Hostinger hPanel**.
2. Go to **Databases** > **MySQL Databases**.
3. Create a new database:
   - **Database Name**: e.g., `u123456_oasis`
   - **Username**: e.g., `u123456_admin`
   - **Password**: Create a strong password and save it.
4. (Optional) Open **phpMyAdmin** for this database and click **Import**, then upload:  
   `backend/database/setup_oasis_resort.sql`  
   *(If skipped, the server will auto-create all tables upon startup).*

---

### Step 2: Set Up Git Deployment in Hostinger
1. In hPanel, go to **Advanced** > **Git**.
2. Enter the following details:
   - **Repository:** `https://github.com/sabirmunna771-coder/Oasis-Resort.git`
   - **Branch:** `main`
   - **Install Path:** Leave as default root or `/public_html`
3. Click **Create** / **Deploy**.
4. Copy the **Webhook URL** provided by Hostinger and add it to your GitHub Repository (**Settings > Webhooks > Add Webhook**).  
   *Now, every time you `git push origin main`, Hostinger will automatically pull the changes!*

---

### Step 3: Configure Node.js in Hostinger hPanel
1. In hPanel, go to **Advanced** > **Node.js** (or search for Node.js in hPanel).
2. Click **Create Application**:
   - **Node.js Version:** `18.x` or `20.x`
   - **Application Root:** `/public_html` (or the folder where Git cloned the repo)
   - **Application Startup File:** `server.js`
3. Under **Environment Variables**, add:
   - `PORT`: `5000` (or leave default assigned by Hostinger)
   - `NODE_ENV`: `production`
   - `DB_HOST`: `localhost`
   - `DB_PORT`: `3306`
   - `DB_USER`: *(your Hostinger database username from Step 1)*
   - `DB_PASSWORD`: *(your Hostinger database password from Step 1)*
   - `DB_NAME`: *(your Hostinger database name from Step 1)*
   - `JWT_SECRET`: `oasis_resort_skardu_production_secret_key_2026`
4. Click **Run NPM Install** (or run `npm install --production`).
5. Click **Start** / **Restart Application**.

🎉 **Your website is now LIVE!**
- Frontend Website: `https://yourdomain.com`
- Admin Dashboard: `https://yourdomain.com/admin`
- Concierge Reception: `https://yourdomain.com/reception`
- Booking Engine: `https://yourdomain.com/book`
- API Health Check: `https://yourdomain.com/api/health`

---

## 🌐 METHOD 2: Split Deployment (Frontend in public_html, Backend on Subdomain)

If your Hostinger plan is Shared Hosting without Node.js on the main domain:

### Frontend:
1. Connect `https://github.com/sabirmunna771-coder/Oasis-Resort-Frontend-latest.git` in Hostinger Git to `/public_html`.
2. The repository already includes `dist/` and `.htaccess`.
3. Apache/LiteSpeed will immediately serve the website without 404 routing errors.

### Backend:
1. Create a subdomain: `api.yourdomain.com`.
2. Connect `https://github.com/sabirmunna771-coder/Oasis-Resort.git` to the subdomain folder.
3. In `frontend`, set `VITE_API_URL=https://api.yourdomain.com` in `.env` before building.

---

## 🔄 Daily Workflow (Make Changes & Auto-Deploy):
1. Make your code changes locally.
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated rooms and pricing"
   git push origin main
   ```
3. Hostinger's Git Webhook will immediately pull the commit, updating your live website in seconds!
