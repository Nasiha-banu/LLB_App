# LLB Real Estate — n8n Automation Engine & Workflows

This directory houses complete production-grade automation workflows for the LLB Real Estate Mobile Platform.

## 🚀 Workflows Included

1. **`01_user_registration_welcome.json`**
   - **Webhook Trigger:** `POST /webhook/user-registration`
   - **Actions:** Parses registered client profile, calculates HNI investor tier, sends branded HTML welcome dossier via SMTP, logs client to CRM, sends SMS confirmation.

2. **`02_auth_otp_password_reset.json`**
   - **Webhook Trigger:** `POST /webhook/auth-otp`
   - **Actions:** Routes to SMS gateway or high-priority SMTP depending on selected delivery channel, dispatches 6-digit cryptographic PIN, logs security audit trail with 10-minute expiry.

3. **`03_property_vip_inquiry_dossier.json`**
   - **Webhook Trigger:** `POST /webhook/property-inquiry`
   - **Actions:** Instantly notifies Senior Property Acquisitions Director on Telegram/Slack with client credentials and property requirements, emails confidential legal scrutiny dossier and CMDA/RERA breakdown to the buyer.

4. **`04_schedule_tour_chauffeur_booking.json`**
   - **Webhook Trigger:** `POST /webhook/schedule-tour`
   - **Actions:** If chauffeur requested, dispatches Mercedes S-Class booking to luxury chauffeur fleet, generates unique gate pass security clearance code, creates Google Calendar / Apple Calendar (.ics) event for client and property caretaker.

5. **`05_price_alert_broadcast.json`**
   - **Webhook Trigger:** `POST /webhook/price-alert`
   - **Actions:** Identifies matching HNI investor profiles, calculates guideline vs market variance, broadcasts WhatsApp alert and triggers mobile app push notification.

---

## 🛠️ How to Run

### Option A: Built-in Standalone n8n Mock Engine (Zero-Install, Immediate)
Run the bundled Node.js mock server that listens on port `5678`:
```bash
node mock-n8n-server.js
```
This accepts all 5 webhook paths, executes simulated logic, prints colorized execution logs, and returns valid workflow IDs.

### Option B: Official n8n via Docker Compose
To run official n8n in Docker:
```bash
docker compose up -d
```
1. Open `http://localhost:5678` in your browser.
2. In n8n, click **Workflows** → **Import from File**.
3. Select any `.json` file from `workflows/`.
4. Click **Activate** (toggle in upper right) to make the webhook listen live!

---

## 📡 Webhook Test Payloads

You can trigger any workflow directly via REST or from the mobile app's **Automation Monitor** screen!
Example test command:
```bash
curl -X POST http://localhost:5000/api/automations/test \
  -H "Content-Type: application/json" \
  -d '{"workflow":"PROPERTY_INQUIRY"}'
```
