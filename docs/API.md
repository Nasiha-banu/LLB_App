# LLB Real Estate — REST API Reference (`/api/v1`)

> **Geographic Specialty:** Parandur Greenfield Airport Corridor, Tamil Nadu, India  
> **Protocol:** HTTPS / JSON REST with JWT access tokens and rotating refresh tokens.

---

## 1. Authentication Endpoints

### Register New User
- **Endpoint:** `POST /api/v1/auth/register`
- **Body:**
  ```json
  {
    "name": "Karthik Subramanian",
    "email": "karthik@example.com",
    "phone": "+919884123456",
    "password": "SecurePassword@123",
    "role": "CUSTOMER"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Account successfully registered for LLB Real Estate.",
    "user": { "id": "usr-8a21fd90", "name": "Karthik Subramanian", "email": "karthik@example.com" },
    "token": "jwt.access.token",
    "accessToken": "jwt.access.token",
    "refreshToken": "rt_8923a10..."
  }
  ```
- **Automations Triggered:** Calls n8n Workflow A (`user-registration`).

### Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Body:** `{ "identifier": "karthik@example.com", "password": "SecurePassword@123" }`
- **Response:** `200 OK` with user profile and rotating tokens.

### Rotate Refresh Token
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Body:** `{ "refreshToken": "rt_8923a10..." }`
- **Response:** `200 OK` with fresh `accessToken` and rotated `refreshToken`.

### Request Password Reset OTP
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Body:** `{ "identifier": "karthik@example.com", "channel": "email" }`
- **Automations Triggered:** Calls n8n Workflow B (`password-reset`) with 15-minute single-use OTP.

---

## 2. Properties Endpoints

### Get Properties Catalog
- **Endpoint:** `GET /api/v1/properties`
- **Query Params:**
  - `search`: Case-insensitive text search (title, location, RERA, DTCP)
  - `propertyId`: Exact ID lookup (e.g. `LLB-PRD-01`)
  - `category`: `Residential Plots`, `Commercial Land`, `Villa Community Plot`, `Farmland Acreage`
  - `minPrice`, `maxPrice`: Numeric INR bounds
  - `minArea`, `maxArea`: Sq.Ft bounds
  - `sort`: `price_asc`, `price_desc`, `area_asc`, `area_desc`, `newest`

### Get Map GeoJSON & Markers
- **Endpoint:** `GET /api/v1/properties/map`
- **Response:** Center coordinates for Parandur Airport (`12.9885, 79.7642`) and array of plots with coordinates, prices, and status.

### Get Property by ID
- **Endpoint:** `GET /api/v1/properties/:id`

---

## 3. Bookings & Enquiries Endpoints

### Submit Plot Booking or Schedule Site Visit
- **Endpoint:** `POST /api/v1/bookings`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "propertyId": "LLB-PRD-01",
    "type": "PLOT_BOOKING",
    "plotUnit": "Plot #15",
    "userName": "Sundar Ramanathan",
    "userEmail": "investor@llb.com",
    "userPhone": "+919876543210",
    "siteVisitDate": "2026-11-05",
    "siteVisitTime": "10:30 AM",
    "notes": "Adjacent plots required. Request legal opinion.",
    "termsAccepted": true,
    "idempotencyKey": "idemp_custom_key_101"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "Plot booking request submitted successfully.",
    "bookingReference": "LLB-PRD-2026-4891",
    "booking": { ... }
  }
  ```
- **Automations Triggered:** Calls n8n Workflow C (`booking-confirmation`) notifying both customer and admin.

### Get Customer's Bookings
- **Endpoint:** `GET /api/v1/bookings/my?email=investor@llb.com`

### Request Booking Cancellation
- **Endpoint:** `POST /api/v1/bookings/:id/cancellation-request`
- **Body:** `{ "reason": "Change in investment timeline" }`
- **Automations Triggered:** Calls n8n Workflow D (`booking-status-update`).

---

## 4. Admin Management Endpoints

All admin endpoints require role `ADMIN` or the header `X-Admin-Secret: llb-admin-key-2026`.

- `GET /api/v1/admin/stats`: Summary counts of plots, reservations, and n8n dispatches.
- `GET /api/v1/admin/bookings`: Full list of customer dockets with status filter.
- `PATCH /api/v1/admin/bookings/:id/status`: Update status to `Approved`, `Confirmed`, `Cancelled`. Dispatches n8n Workflow D.
- `POST /api/v1/admin/properties`: Create a new Parandur listing.
- `PUT /api/v1/admin/properties/:id`: Edit plot pricing, availability, and coordinates.
- `GET /api/v1/admin/automation-logs`: Live audit of n8n webhook deliveries.
