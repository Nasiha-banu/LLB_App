# LLB Real Estate — Local Setup & Development Guide

> **Project:** LLB Real Estate Full-Stack Mobile Platform (Parandur Greenfield Airport Corridor, Tamil Nadu, India)  
> **Brand Aesthetic:** Strict 90% White / 10% Black luxury minimalist design with zero visual overlaps.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18+ or v20+ (LTS recommended)
- **npm**: v9+ (On Windows PowerShell, use `npm.cmd` and `npx.cmd`)
- **Git**
- Optional: **PostgreSQL** v14+ (If not running, the platform seamlessly uses local JSON/SQLite persistence)
- Optional: **Docker** (For local self-hosted n8n instance)

---

## 2. Directory Architecture

```text
llb-realestate-mobile/
├── backend/            # Express REST API, JWT auth, Nodemailer & n8n dispatcher
│   ├── data/           # Parandur properties, bookings, users & audit logs
│   ├── src/            # Modular routes, controllers, and services
│   └── package.json
├── mobile/             # React/Vite cross-platform mobile web simulator (Port 3000)
│   ├── src/components/ # Home, Properties, Map, My Bookings, Profile & Admin
│   └── package.json
├── native-app/         # React Native with Expo (iOS & Android with EAS build)
│   ├── src/            # Native components & screens
│   ├── app.json        # Expo Application configuration
│   └── package.json
├── prisma/             # PostgreSQL database layer
│   ├── schema.prisma   # 14 normalized models with indexes & constraints
│   └── seed.ts         # Parandur seed script
├── n8n-automations/    # 5 Production n8n workflows & mock webhook server
│   ├── workflows/      # JSON workflows for import
│   ├── mock-n8n-server.js # Local n8n simulation engine (Port 5678)
│   └── docker-compose.yml
├── docs/               # Technical and deployment documentation
└── start-all.bat       # One-click Windows launch script
```

---

## 3. Quick Start (Windows One-Click)

From the root directory, simply run:
```bat
start-all.bat
```
This launches:
1. **Backend API Server** on `http://localhost:5000`
2. **n8n Automation Engine** on `http://localhost:5678`
3. **Mobile App Preview Simulator** on `http://localhost:3000`

---

## 4. Manual Service-by-Service Startup

### Step A: Backend REST API
```powershell
cd backend
npm.cmd install
node src/server.js
```
- API Base: `http://localhost:5000/api/v1`
- Health check: `http://localhost:5000/api/health`

### Step B: n8n Automation Engine (Port 5678)
```powershell
cd n8n-automations
node mock-n8n-server.js
```
Or start real n8n with Docker:
```powershell
docker-compose up -d
```

### Step C: Mobile Web Simulator (Port 3000)
```powershell
cd mobile
npm.cmd install
npm.cmd run dev -- --host
```
Open `http://localhost:3000` in any desktop browser or mobile browser.

### Step D: React Native Expo Mobile App (iOS / Android)
```powershell
cd native-app
npm.cmd install
npx.cmd expo start
```
- Scan QR code with **Expo Go** on Android or camera on iOS.
- Press `a` for Android emulator or `i` for iOS simulator.

---

## 5. Demo Accounts

| Role | Email / Phone | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@llb.com` | `Admin@123` | Full Admin Console, listing management, booking status approvals |
| **HNI Investor** | `investor@llb.com` | `Password@123` | Plot booking, site visit reservations, cancellation requests |
| **Customer** | `priya@chennai.com` | `Password@123` | Browse Parandur parcels, schedule chauffeur tours, saved plots |
