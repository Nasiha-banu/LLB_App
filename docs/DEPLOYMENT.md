# LLB Real Estate — Production Deployment & EAS Build Guide

> **Target Stores:** Google Play Store (Android) & Apple App Store (iOS)  
> **Mobile Framework:** React Native with Expo (SDK 52)  
> **Backend:** Node.js Express on Render, Railway, or AWS ECS  
> **Database:** Managed PostgreSQL (Supabase, Neon, or AWS RDS)

---

## 1. Environment Configuration

### Backend `.env`
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://llb_user:password@db.supabase.co:5432/llb_realestate?sslmode=require
JWT_SECRET=production_ultra_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
N8N_BASE_URL=https://n8n.yourdomain.com/webhook
N8N_WEBHOOK_SECRET=production_webhook_secret_parandur_2026
N8N_MOCK_FALLBACK=false
```

### Mobile Frontend `.env`
```env
EXPO_PUBLIC_API_URL=https://api.llbrealestate.com/api/v1
EXPO_PUBLIC_SOCKET_URL=wss://api.llbrealestate.com
```

---

## 2. Database Migrations (Prisma)

When connecting to managed PostgreSQL:
```powershell
npx.cmd prisma migrate deploy
npx.cmd ts-node prisma/seed.ts
```

---

## 3. Expo Application Services (EAS) Mobile Builds

### Step A: Install EAS CLI
```powershell
npm.cmd install -g eas-cli
eas login
```

### Step B: Configure EAS Project
```powershell
cd native-app
eas build:configure
```

### Step C: Build Android APK / Android App Bundle (AAB)
```powershell
# For internal testing APK:
eas build --platform android --profile preview

# For Google Play Store AAB release:
eas build --platform android --profile production
```

### Step D: Build iOS Application (IPA)
```powershell
# For Apple TestFlight / App Store submission:
eas build --platform ios --profile production
```

### Step E: Submit to Stores
```powershell
# Submit Android build to Google Play Store track:
eas submit --platform android

# Submit iOS build to App Store Connect:
eas submit --platform ios
```

---

## 4. Webhook and Production Monitoring

- Maintain HTTPS certificate renewal via Cloudflare or Let's Encrypt.
- Verify that n8n webhook URLs in production point to `https://...`.
- Set database automated daily snapshots.
- Check `/api/health` on your monitoring system (Datadog, UptimeKuma, or BetterStack).
