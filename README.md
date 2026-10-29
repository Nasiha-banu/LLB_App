# LLB Real Estate — Production Full-Stack Mobile Platform

[![Platform](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-064E3B.svg)]()
[![Focus](https://img.shields.io/badge/Focus-Parandur%20Greenfield%20Airport-emerald.svg)]()
[![Approvals](https://img.shields.io/badge/Approvals-100%25%20DTCP%20%26%20TN%20RERA-blue.svg)]()
[![Engine](https://img.shields.io/badge/Engine-n8n%20Workflows-orange.svg)]()
[![Theme](https://img.shields.io/badge/Theme-Imperial%20Emerald%20%26%20Champagne%20Gold-D4AF37.svg)]()

Complete, production-ready, cross-platform mobile application and backend platform for **LLB Real Estate**, specializing in land and plot developments across the **Parandur Greenfield International Airport corridor, Tamil Nadu, India** (including Sunguvarchatram Industrial Corridor, Thandalam Junction, Edayarpakkam, Podavur, and Nelvoy).

---

## 🏛️ Brand & UI/UX Standards (Online Real Estate Reference: Sotheby's / Compass)

- **Brand Name:** LLB REAL ESTATE
- **Theme & Palette:** **Imperial Emerald & Champagne Gold Prestige**
  - **Primary Brand:** Deep Forest Emerald (`#064E3B`, `#022C22`) — symbolizing land prestige, nature, and sovereign capital.
  - **Metallic Accents:** Brushed Champagne Gold (`#D4AF37`, `#C5A880`) — badge borders, rating stars, and focus indicators.
  - **Surfaces:** Soft Alabaster Ivory canvas (`#F8F9FA`) and pure pearl white cards (`#FFFFFF`).
  - **Dark Contrast Elements:** Obsidian Slate (`#0F172A`) for high-contrast headlines and dark cards.
- **Typography:** Refined font pairing — Editorial Serif (*Playfair Display* & *Cinzel*) paired with clean mobile sans-serif (*Plus Jakarta Sans*).
- **Interactive Map:** Centered on Parandur, Tamil Nadu (`12.9885° N, 79.7642° E`) with custom Leaflet emerald price pills (`📍 ₹21.75 L`) and bottom preview sheets.

---

## 📱 Navigation Structure (5 Bottom Tabs)

1. **Home:** Imperial Emerald hero card, Parandur Airport Corridor Capex metrics (₹40,000 Cr, 100% DTCP clear, 30-40 ft groundwater), micro-market pills (Airport North Gate, Sunguvarchatram, Thandalam), curated plot cards, 4 pillars of land security, and WhatsApp/Call shortcuts.
2. **Explore:** Complete catalog with grid/list toggle, text search by name/road/RERA ID, budget pills (`< ₹25L`, `₹25L - ₹50L`, `₹1 Cr+`), extent in Sq.Ft & Cents, and multi-parameter sorting.
3. **Corridor Map:** Interactive GPS map centered on Parandur with custom emerald price chips, airport hub beacon, and bottom snapshot card with turn-by-turn route directions.
4. **My Bookings:** Customer reservation dockets (`#LLB-PRD-2026-XXXX`), milestone tracking (`Docket Issued` &rarr; `Title Vetted` &rarr; `Site Visit` &rarr; `Deed Registered`), assigned chauffeur pass with vehicle plate (`Toyota Innova Crysta TN-09-CB-4491`), and in-app cancellation/reschedule modal.
5. **Profile:** VIP HNWI Member Card, 1-click Demo Switcher (`[Demo Investor]` / `[Demo Admin]`), Saved plots gallery, Parandur Buying Guide, and direct launch into the **Admin Operations Console**.

---

## 🚀 Two Distinct Plot Booking Actions

From any plot detail dossier:
- **Action A: Schedule a Site Visit:** Complimentary chauffeur-driven executive pickup from Chennai International Airport (MAA), Koyambedu CMBT, or Guindy directly to the plot.
- **Action B: Submit a Plot Booking Request:** Select plot unit (e.g. Plot #04, Plot #15), generate official docket `#LLB-PRD-2026-XXXX`, lock in price with zero escalation, and trigger automated n8n notifications.

---

## ⚡ n8n Automation Engine (5 Production Workflows)

All webhooks are invoked from the backend with HMAC secret validation:
1. `01_user_registration_welcome.json` (`webhook/user-registration`): Customer welcome dossier & CRM investor onboarding.
2. `02_auth_otp_password_reset.json` (`webhook/password-reset`): 15-minute single-use cryptographic PIN with zero credential leakage.
3. `03_property_booking_confirmation.json` (`webhook/booking-confirmation`): Customer booking docket confirmation & high-priority admin alert.
4. `04_booking_status_update.json` (`webhook/booking-status-update`): Dispatched upon admin status approval or rescheduling.
5. `05_site_visit_followup.json` (`webhook/site-visit-followup`): 24-hour pre-visit inspection reminder with GPS pin and driver contact.

---

## 🛠️ Quick Windows Start

```bat
start-all.bat
```
- **Mobile Simulator:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api/v1`
- **n8n Mock Engine:** `http://localhost:5678`
