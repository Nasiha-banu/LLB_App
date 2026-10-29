# LLB Real Estate — n8n Automation Engine Guide

> **Architecture:** Secured backend webhooks dispatches to n8n workflows. No private credentials or webhook secrets are ever exposed to the mobile frontend.

---

## 1. The 5 Production Workflows

The platform includes 5 production-ready workflows ready for instant import:

| Workflow File | Trigger Webhook | Destination | Purpose |
| :--- | :--- | :--- | :--- |
| `01_user_registration_welcome.json` | `webhook/user-registration` | Customer Email & CRM | Sends welcome package, growth corridor PDF, creates investor lead |
| `02_auth_otp_password_reset.json` | `webhook/password-reset` | Customer Email / SMS | Dispatches 15-minute single-use OTP with zero credential leaks |
| `03_property_booking_confirmation.json` | `webhook/booking-confirmation` | Customer + Admin Alert | Generates docket `#LLB-PRD-2026-XXXX`, sends confirmations & reserves chauffeur |
| `04_booking_status_update.json` | `webhook/booking-status-update` | Customer Email & Audit | Notifies customer upon admin approval/rescheduling/cancellation |
| `05_site_visit_followup.json` | `webhook/site-visit-followup` | Customer Email & WhatsApp | Sends 24h pre-visit reminder with Google Maps pin & chauffeur escort details |

---

## 2. Importing Workflows into n8n

1. Open your n8n web interface (e.g. `http://localhost:5678` or hosted cloud instance).
2. Go to **Workflows** → **Import from File**.
3. Select any file from `n8n-automations/workflows/`.
4. Configure your SMTP / Email credentials node:
   - Host: e.g. `smtp.sendgrid.net` or `smtp.gmail.com`
   - Port: `465` (SSL) or `587` (TLS)
   - User & Password: Provided by your transactional email provider.
5. Toggle the workflow to **Active**.

---

## 3. Webhook Authentication & Security

All webhook dispatches from the backend include:
- `X-LLB-Automation-Source: llb-mobile-backend`
- `X-LLB-Webhook-Secret: <Configured in N8N_WEBHOOK_SECRET>`
- `X-LLB-Event-ID: <Unique UUID for idempotency>`

This guarantees that unauthorized third-party callers cannot invoke your n8n automations.

---

## 4. Local Simulation Engine (Port 5678)

For local development without Docker or cloud n8n, run:
```powershell
node n8n-automations/mock-n8n-server.js
```
The server validates payloads, logs formatted execution actions, and returns 200 OK with simulated delivery tracking tokens.
