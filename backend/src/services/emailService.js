const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const EMAILS_FILE = path.join(__dirname, '../../data/sent_emails.json');

// Ensure data directory & sent_emails.json exists
let memoryEmails = [];

function ensureEmailsStore() {
  try {
    const dir = path.dirname(EMAILS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(EMAILS_FILE)) {
      fs.writeFileSync(EMAILS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    // In serverless / read-only filesystem environments (Vercel)
  }
}

function getStoredEmails() {
  ensureEmailsStore();
  try {
    const raw = fs.readFileSync(EMAILS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return memoryEmails;
  }
}

function saveStoredEmails(emails) {
  memoryEmails = emails;
  try {
    ensureEmailsStore();
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2), 'utf8');
  } catch (err) {
    // Read-only filesystem on Vercel, saved in memory
  }
}

// Build Nodemailer Transporter
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      }
    });
    console.log(`📧 [Email Service] Using configured SMTP: ${config.SMTP_HOST}:${config.SMTP_PORT} (${config.SMTP_USER})`);
  } else {
    // Generate Ethereal Test Account for automatic live web preview
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`📧 [Email Service] Using Ethereal Email test account: ${testAccount.user}`);
    } catch {
      transporter = nodemailer.createTransport({ jsonTransport: true });
      console.log(`📧 [Email Service] Using JSON transport fallback.`);
    }
  }

  return transporter;
}

/**
 * Universal email dispatcher that records to sent_emails.json
 */
async function dispatchEmail({ to, subject, html, type, workflow, metadata = {} }) {
  const emailId = `mail-${Date.now()}-${uuidv4().substring(0, 6)}`;
  const timestamp = new Date().toISOString();
  let messageId = null;
  let previewUrl = null;
  let sendStatus = 'DELIVERED_VIA_N8N';

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      html
    });

    messageId = info.messageId;
    previewUrl = nodemailer.getTestMessageUrl(info) || null;
    console.log(`📧 [Email Dispatched] Type: ${type} | To: ${to} | MsgId: ${messageId}`);
    if (previewUrl) {
      console.log(`🔗 [Live Preview URL]: ${previewUrl}`);
    }
  } catch (err) {
    console.warn(`⚠️ [Email Service] SMTP send error: ${err.message}. Saving to persistent outbox.`);
    sendStatus = 'PERSISTED_OUTBOX';
  }

  const emailRecord = {
    id: emailId,
    type,
    recipient: to,
    subject,
    html,
    messageId,
    previewUrl,
    timestamp,
    n8nWorkflow: workflow || 'generic_workflow.json',
    status: sendStatus,
    metadata
  };

  const emails = getStoredEmails();
  emails.unshift(emailRecord);
  if (emails.length > 200) emails.pop();
  saveStoredEmails(emails);

  return emailRecord;
}

/**
 * HTML Templates
 */

// 1. User Registration Welcome HTML
function buildRegistrationWelcomeHtml(user) {
  const userName = user.name || 'Valued Investor';
  const userEmail = user.email || 'your-email@example.com';
  const userPhone = user.phone || '+91 94441 23456';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to LLB Real Estate</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(6,78,59,0.08); }
    .header { background: linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .brand-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(255,255,255,0.15); border: 1px solid rgba(212,175,55,0.5); font-size: 10px; font-weight: 800; color: #FDE68A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .brand-title { font-size: 22px; font-weight: 900; letter-spacing: 2px; margin: 0; color: #FFFFFF; font-family: Georgia, serif; }
    .brand-subtitle { font-size: 11px; color: #A7F3D0; margin-top: 4px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .salutation { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
    .intro { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .account-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
    .account-card h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #064E3B; margin-top: 0; margin-bottom: 12px; font-weight: 800; }
    .account-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dashed #E2E8F0; }
    .account-row:last-child { border-bottom: none; }
    .label { color: #64748B; }
    .val { font-weight: 700; color: #0F172A; }
    .corridor-box { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 1px solid #86EFAC; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
    .corridor-box h4 { margin: 0 0 8px 0; color: #166534; font-size: 13px; font-weight: 800; }
    .corridor-box p { margin: 0; font-size: 12px; line-height: 1.5; color: #14532D; }
    .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    .spec-item { background: #FFFFFF; border-radius: 8px; padding: 8px 10px; font-size: 11px; border: 1px solid #BBF7D0; }
    .spec-title { font-weight: bold; color: #166534; }
    .spec-desc { color: #475569; font-size: 10px; margin-top: 2px; }
    .cta-button { display: block; text-align: center; background: linear-gradient(135deg, #064E3B 0%, #042F24 100%); color: #FFFFFF !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 14px 24px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.4); box-shadow: 0 4px 14px rgba(6,78,59,0.25); margin: 24px 0; }
    .footer { background: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 10px; color: #64748B; line-height: 1.5; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">✈️ n8n Automation Engine Dispatched</div>
      <h1 class="brand-title">LLB REAL ESTATE</h1>
      <div class="brand-subtitle">Parandur Greenfield International Airport Corridor Specialists</div>
    </div>
    <div class="content">
      <div class="salutation">Dear ${userName},</div>
      <p class="intro">
        Welcome to <strong>LLB Real Estate</strong>. Your investor profile has been successfully certified for private land acquisitions in the upcoming <strong>Parandur Greenfield International Airport Corridor</strong> (Tamil Nadu).
      </p>
      <div class="account-card">
        <h3>🏛️ Certified Investor Credentials</h3>
        <div class="account-row"><span class="label">Investor Name:</span><span class="val">${userName}</span></div>
        <div class="account-row"><span class="label">Registered Email:</span><span class="val">${userEmail}</span></div>
        <div class="account-row"><span class="label">Registered Mobile:</span><span class="val">${userPhone}</span></div>
        <div class="account-row"><span class="label">Membership Tier:</span><span class="val" style="color: #065F46;">VIP Sovereign Corridor Member</span></div>
        <div class="account-row"><span class="label">Title Vetting:</span><span class="val" style="color: #047857;">100% DTCP & TN RERA Certified</span></div>
      </div>
      <div class="corridor-box">
        <h4>✈️ Parandur Airport Corridor Macro Overview (2026–2030)</h4>
        <p>Spanning <strong>4,791 acres</strong> with 2 parallel runways and 2 terminals, Parandur represents a <strong>₹40,000 Crore</strong> infrastructure development. All parcels curated by LLB Real Estate sit outside the acquired airport perimeter in high-velocity commercial and residential sectors.</p>
        <div class="specs-grid">
          <div class="spec-item"><div class="spec-title">🛣️ 40–60 Ft Roads</div><div class="spec-desc">Blacktop Tar Avenue</div></div>
          <div class="spec-item"><div class="spec-title">💧 30–35 Ft Water</div><div class="spec-desc">Sweet Potable Aquifer</div></div>
          <div class="spec-item"><div class="spec-title">📜 30-Year EC</div><div class="spec-desc">High Court Vetted Title</div></div>
          <div class="spec-item"><div class="spec-title">🔒 0% Escalation</div><div class="spec-desc">Guaranteed Lock-in Price</div></div>
        </div>
      </div>
      <a href="http://localhost:3000" class="cta-button">Launch Investor App & Explore Verified Plots &rarr;</a>
    </div>
    <div class="footer">
      <strong>LLB Real Estate</strong> • TN RERA: TN/AGENT/0892/2024 • DTCP: DTCP/REG/KPM/2023/104<br>
      Automated via n8n Engine • Port 5678
    </div>
  </div>
</body>
</html>`;
}

// 2. Plot Booking - Customer Confirmation HTML
function buildBookingCustomerHtml(booking, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Plot Booking Confirmation</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(6,78,59,0.08); }
    .header { background: linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%); padding: 30px 24px; text-align: center; color: #FFFFFF; }
    .docket-badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; background: rgba(255,255,255,0.15); border: 1px solid #FDE68A; font-size: 11px; font-weight: 800; color: #FDE68A; margin-bottom: 8px; }
    .content { padding: 30px 24px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #E2E8F0; }
    .row:last-child { border-bottom: none; }
    .highlight { color: #064E3B; font-weight: 800; font-size: 14px; }
    .cta { display: block; text-align: center; background: #064E3B; color: #FFFFFF !important; text-decoration: none; font-size: 12px; font-weight: 800; padding: 12px 20px; border-radius: 10px; margin: 20px 0; }
    .footer { background: #F1F5F9; padding: 16px; text-align: center; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="docket-badge">Docket #${booking.bookingReference}</div>
      <h2 style="margin: 0; color: #FFFFFF; font-family: Georgia, serif;">Plot Reservation Submitted</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #A7F3D0;">LLB Real Estate • Parandur Greenfield Airport Corridor</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        Dear <strong>${booking.userName}</strong>,<br>
        Thank you for choosing LLB Real Estate. Your plot reservation request has been officially received and logged into our land allotment ledger.
      </p>

      <div class="card">
        <h4 style="margin: 0 0 10px 0; color: #064E3B; font-size: 12px; text-transform: uppercase;">📋 Reservation Docket Summary</h4>
        <div class="row"><span>Booking Reference:</span><strong>#${booking.bookingReference}</strong></div>
        <div class="row"><span>Shortlisted Property:</span><strong>${property.title || booking.propertyTitle}</strong></div>
        <div class="row"><span>Plot Unit:</span><strong>${booking.plotUnit || 'Prime Plot'}</strong></div>
        <div class="row"><span>Extent Area:</span><span>${property.areaSqFt ? property.areaSqFt.toLocaleString() + ' Sq.Ft' : 'Custom Parcel'}</span></div>
        <div class="row"><span>Lock-in Price:</span><span class="highlight">${property.totalPrice ? property.totalPrice : booking.priceFormatted}</span></div>
        <div class="row"><span>Vetting Status:</span><span style="color: #047857; font-weight: bold;">100% DTCP & TN RERA Approved</span></div>
        <div class="row"><span>Submission Time:</span><span>${new Date(booking.createdAt).toLocaleString()}</span></div>
      </div>

      <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 14px; font-size: 11px; color: #166534;">
        <strong>Next Steps:</strong> Our Senior Land Acquisition Director is preparing your complete title extract (30-year EC, Revenue Patta, and FMB sketch). We will call you directly at <strong>${booking.userPhone}</strong> within 2 hours.
      </div>

      <a href="http://localhost:3000" class="cta">Track Booking in LLB Investor App &rarr;</a>
    </div>
    <div class="footer">
      LLB Real Estate • Head Office: Gandhi Road, Kanchipuram • Site Office: NH-48 Sunguvarchatram
    </div>
  </div>
</body>
</html>`;
}

// 3. Plot Booking - Owner / Admin High-Priority Alert HTML
function buildBookingOwnerAlertHtml(booking, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Plot Booking Alert</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEF2F2; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #FCA5A5; box-shadow: 0 10px 30px rgba(185,28,28,0.1); }
    .header { background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%); padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); font-size: 10px; font-weight: 800; color: #FEF08A; text-transform: uppercase; margin-bottom: 6px; }
    .content { padding: 28px 24px; }
    .lead-card { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 14px; padding: 16px; margin: 16px 0; }
    .row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #FECDD3; }
    .row:last-child { border-bottom: none; }
    .action-btn { display: inline-block; padding: 10px 18px; border-radius: 10px; font-size: 12px; font-weight: 800; text-decoration: none; margin-right: 8px; }
    .footer { background: #F8FAFC; padding: 14px; text-align: center; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="alert-badge">🚨 IMMEDIATE ACTION REQUIRED</div>
      <h2 style="margin: 0; color: #FFFFFF;">New Plot Booking Received</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #FCA5A5;">Reference Docket: #${booking.bookingReference}</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        A new buyer has locked in a plot reservation through the LLB Real Estate Mobile Portal.
      </p>

      <div class="lead-card">
        <h4 style="margin: 0 0 10px 0; color: #991B1B; font-size: 12px; text-transform: uppercase;">👤 Buyer Contact Profile</h4>
        <div class="row"><span>Investor Name:</span><strong>${booking.userName}</strong></div>
        <div class="row"><span>Phone:</span><strong><a href="tel:${booking.userPhone}" style="color: #991B1B;">${booking.userPhone}</a></strong></div>
        <div class="row"><span>Email:</span><strong><a href="mailto:${booking.userEmail}" style="color: #991B1B;">${booking.userEmail}</a></strong></div>
        <div class="row"><span>Selected Property:</span><strong>${property.title || booking.propertyTitle}</strong></div>
        <div class="row"><span>Plot Unit:</span><strong>${booking.plotUnit || 'Standard Plot'}</strong></div>
        <div class="row"><span>Listed Price:</span><strong style="color: #991B1B;">${property.totalPrice || booking.priceFormatted}</strong></div>
        <div class="row"><span>Investor Notes:</span><span>${booking.notes || 'None provided'}</span></div>
      </div>

      <div style="margin: 20px 0;">
        <a href="tel:${booking.userPhone}" style="background: #064E3B; color: #FFFFFF;" class="action-btn">📞 Call Buyer Now</a>
        <a href="https://wa.me/${(booking.userPhone || '').replace(/[^0-9]/g, '')}" style="background: #25D366; color: #FFFFFF;" class="action-btn">💬 Open WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      LLB Real Estate Internal Owner Alert • Delivered directly to ${config.OWNER_EMAIL}
    </div>
  </div>
</body>
</html>`;
}

// 4. Site Visit - Customer Confirmation HTML
function buildSiteVisitCustomerHtml(booking, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Site Visit Scheduled</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(6,78,59,0.08); }
    .header { background: linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%); padding: 30px 24px; text-align: center; color: #FFFFFF; }
    .badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; background: rgba(255,255,255,0.15); border: 1px solid #FDE68A; font-size: 11px; font-weight: 800; color: #FDE68A; margin-bottom: 8px; }
    .content { padding: 30px 24px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #E2E8F0; }
    .row:last-child { border-bottom: none; }
    .footer { background: #F1F5F9; padding: 16px; text-align: center; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🚗 Chauffeur Inspection Confirmed</div>
      <h2 style="margin: 0; color: #FFFFFF; font-family: Georgia, serif;">Parandur Site Visit Scheduled</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #A7F3D0;">Reference Docket: #${booking.bookingReference}</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        Dear <strong>${booking.userName}</strong>,<br>
        Your executive site inspection for <strong>${property.title || booking.propertyTitle}</strong> is scheduled. A complimentary AC chauffeur has been reserved for your visit.
      </p>

      <div class="card">
        <h4 style="margin: 0 0 10px 0; color: #064E3B; font-size: 12px; text-transform: uppercase;">📅 Site Inspection Coordinates</h4>
        <div class="row"><span>Scheduled Date:</span><strong>${booking.siteVisitDate || 'As requested'}</strong></div>
        <div class="row"><span>Preferred Time:</span><strong>${booking.siteVisitTime || '10:00 AM'}</strong></div>
        <div class="row"><span>Plot Layout:</span><strong>${property.title || booking.propertyTitle}</strong></div>
        <div class="row"><span>Location:</span><span>${property.location || 'Parandur Greenfield Airport Corridor'}</span></div>
        <div class="row"><span>Dedicated Vehicle:</span><strong>Toyota Innova Crysta (Complimentary)</strong></div>
        <div class="row"><span>Pickup Coordination:</span><span>Driver contact dispatched 2 hours prior</span></div>
      </div>

      <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 14px; font-size: 11px; color: #166534;">
        <strong>Site Office Contact:</strong> Aero Vista Hub, NH-48 Sunguvarchatram Toll Plaza, Tamil Nadu. Direct helpline: <strong>+91 94441 23456</strong>.
      </div>
    </div>
    <div class="footer">
      LLB Real Estate • TN RERA Reg: TN/AGENT/0892/2024
    </div>
  </div>
</body>
</html>`;
}

// 5. Site Visit - Owner / Admin Alert HTML
function buildSiteVisitOwnerAlertHtml(booking, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Site Visit Scheduled</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEF2F2; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #FCA5A5; }
    .header { background: linear-gradient(135deg, #B45309 0%, #78350F 100%); padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); font-size: 10px; font-weight: 800; color: #FEF08A; text-transform: uppercase; margin-bottom: 6px; }
    .content { padding: 28px 24px; }
    .card { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 14px; padding: 16px; margin: 16px 0; }
    .row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #FDE68A; }
    .row:last-child { border-bottom: none; }
    .action-btn { display: inline-block; padding: 10px 18px; border-radius: 10px; font-size: 12px; font-weight: 800; text-decoration: none; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🚗 CHAUFFEUR DISPATCH REQUIRED</div>
      <h2 style="margin: 0; color: #FFFFFF;">New Site Visit Booking</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #FDE68A;">Docket #${booking.bookingReference}</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        An investor has requested an on-site inspection in Parandur. Please assign a chauffeur vehicle.
      </p>
      <div class="card">
        <div class="row"><span>Investor Name:</span><strong>${booking.userName}</strong></div>
        <div class="row"><span>Phone:</span><strong><a href="tel:${booking.userPhone}">${booking.userPhone}</a></strong></div>
        <div class="row"><span>Email:</span><strong><a href="mailto:${booking.userEmail}">${booking.userEmail}</a></strong></div>
        <div class="row"><span>Target Property:</span><strong>${property.title || booking.propertyTitle}</strong></div>
        <div class="row"><span>Visit Date:</span><strong>${booking.siteVisitDate}</strong></div>
        <div class="row"><span>Visit Time:</span><strong>${booking.siteVisitTime}</strong></div>
        <div class="row"><span>Notes:</span><span>${booking.notes || 'None'}</span></div>
      </div>
      <div>
        <a href="tel:${booking.userPhone}" style="background: #064E3B; color: #FFFFFF;" class="action-btn">📞 Call Buyer</a>
        <a href="https://wa.me/${(booking.userPhone || '').replace(/[^0-9]/g, '')}" style="background: #25D366; color: #FFFFFF;" class="action-btn">💬 WhatsApp</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 6. Property Enquiry - Customer Confirmation HTML
function buildEnquiryCustomerHtml(inquiry, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Property Enquiry Acknowledged</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; }
    .header { background: linear-gradient(135deg, #064E3B 0%, #043828 100%); padding: 28px 24px; text-align: center; color: #FFFFFF; }
    .content { padding: 28px 24px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 16px; margin: 16px 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #FFFFFF;">Enquiry Received</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #A7F3D0;">LLB Real Estate • Parandur Airport Corridor Advisory</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        Dear <strong>${inquiry.clientName}</strong>,<br>
        Thank you for enquiring about <strong>${property.title}</strong>. Our land acquisition advisory desk has logged your request.
      </p>
      <div class="card">
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Location:</strong> ${property.location}</p>
        <p><strong>Price:</strong> ${property.totalPrice} (${property.pricePerSqFt}/sq.ft)</p>
        <p><strong>Your Message:</strong> <em>"${inquiry.message}"</em></p>
      </div>
      <p style="font-size: 12px; color: #475569;">
        An advisory director will reach out to you directly at <strong>${inquiry.clientPhone || inquiry.clientEmail}</strong> with the detailed TN RERA layout and revenue patta sketch.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// 7. Property Enquiry - Owner / Admin Alert HTML
function buildEnquiryOwnerAlertHtml(inquiry, property) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Property Enquiry Lead</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEF2F2; margin: 0; padding: 20px; color: #0F172A; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #FCA5A5; }
    .header { background: linear-gradient(135deg, #0F766E 0%, #115E59 100%); padding: 26px 24px; text-align: center; color: #FFFFFF; }
    .content { padding: 26px 24px; }
    .lead-card { background: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 14px; padding: 16px; margin: 16px 0; font-size: 12px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #CCFBF1; }
    .row:last-child { border-bottom: none; }
    .btn { display: inline-block; padding: 8px 16px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #FFFFFF;">💼 New Buyer Enquiry Lead</h2>
      <p style="margin: 4px 0 0; font-size: 11px; color: #CCFBF1;">Target: ${property.title}</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; color: #334155; margin-top: 0;">
        A new buyer enquiry was submitted via the LLB Mobile App:
      </p>
      <div class="lead-card">
        <div class="row"><span>Client Name:</span><strong>${inquiry.clientName}</strong></div>
        <div class="row"><span>Phone:</span><strong><a href="tel:${inquiry.clientPhone}">${inquiry.clientPhone || 'Not provided'}</a></strong></div>
        <div class="row"><span>Email:</span><strong><a href="mailto:${inquiry.clientEmail}">${inquiry.clientEmail || 'Not provided'}</a></strong></div>
        <div class="row"><span>Property ID:</span><strong>${property.id}</strong></div>
        <div class="row"><span>Property:</span><strong>${property.title}</strong></div>
        <div class="row"><span>Message:</span><em>${inquiry.message}</em></div>
      </div>
      <div>
        ${inquiry.clientPhone ? `<a href="tel:${inquiry.clientPhone}" style="background: #064E3B; color: #FFFFFF;" class="btn">📞 Call Client</a>` : ''}
        ${inquiry.clientPhone ? `<a href="https://wa.me/${inquiry.clientPhone.replace(/[^0-9]/g, '')}" style="background: #25D366; color: #FFFFFF;" class="btn">💬 WhatsApp</a>` : ''}
        ${inquiry.clientEmail ? `<a href="mailto:${inquiry.clientEmail}" style="background: #0284C7; color: #FFFFFF;" class="btn">✉️ Reply by Mail</a>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  getStoredEmails,
  dispatchEmail,

  getLatestEmailForRecipient(email) {
    const emails = getStoredEmails();
    if (!email) return emails[0] || null;
    return emails.find(e => e.recipient?.toLowerCase() === email.toLowerCase()) || emails[0] || null;
  },

  // 1. User Registration Welcome
  async sendRegistrationWelcomeEmail(user) {
    const recipient = user.email;
    if (!recipient) return null;

    return await dispatchEmail({
      to: recipient,
      subject: '✈️ Welcome to LLB Real Estate — Parandur Airport Corridor Investor Dossier',
      html: buildRegistrationWelcomeHtml(user),
      type: 'USER_REGISTRATION',
      workflow: '01_user_registration_welcome.json',
      metadata: { userId: user.id, userName: user.name }
    });
  },

  // 2. Plot Booking Dual Dispatch (Investor + Owner)
  async sendPlotBookingDualEmails({ booking, property }) {
    const results = {};
    const ownerEmail = config.OWNER_EMAIL || 'taskflow.notification@gmail.com';

    // A. Send to Investor
    if (booking.userEmail) {
      results.investorEmail = await dispatchEmail({
        to: booking.userEmail,
        subject: `📋 Plot Reservation Docket #${booking.bookingReference} — ${property.title} | LLB Real Estate`,
        html: buildBookingCustomerHtml(booking, property),
        type: 'BOOKING_CONFIRMATION_CUSTOMER',
        workflow: '03_property_booking_confirmation.json',
        metadata: { bookingReference: booking.bookingReference, propertyId: property.id }
      });
    }

    // B. Send to Owner / Management
    results.ownerEmail = await dispatchEmail({
      to: ownerEmail,
      subject: `🚨 NEW PLOT BOOKING: #${booking.bookingReference} by ${booking.userName} (${property.title})`,
      html: buildBookingOwnerAlertHtml(booking, property),
      type: 'BOOKING_CONFIRMATION_OWNER',
      workflow: '03_property_booking_confirmation.json',
      metadata: { bookingReference: booking.bookingReference, propertyId: property.id, buyerName: booking.userName }
    });

    return results;
  },

  // 3. Site Visit Dual Dispatch (Investor + Owner)
  async sendSiteVisitDualEmails({ booking, property }) {
    const results = {};
    const ownerEmail = config.OWNER_EMAIL || 'taskflow.notification@gmail.com';

    // A. Send to Investor
    if (booking.userEmail) {
      results.investorEmail = await dispatchEmail({
        to: booking.userEmail,
        subject: `🚗 Site Visit Scheduled: Docket #${booking.bookingReference} — ${property.title} | LLB Real Estate`,
        html: buildSiteVisitCustomerHtml(booking, property),
        type: 'SITE_VISIT_CUSTOMER',
        workflow: '05_site_visit_followup.json',
        metadata: { bookingReference: booking.bookingReference, visitDate: booking.siteVisitDate }
      });
    }

    // B. Send to Owner / Management
    results.ownerEmail = await dispatchEmail({
      to: ownerEmail,
      subject: `🚗 NEW SITE VISIT: ${booking.userName} for ${property.title} on ${booking.siteVisitDate}`,
      html: buildSiteVisitOwnerAlertHtml(booking, property),
      type: 'SITE_VISIT_OWNER',
      workflow: '05_site_visit_followup.json',
      metadata: { bookingReference: booking.bookingReference, visitDate: booking.siteVisitDate, buyerName: booking.userName }
    });

    return results;
  },

  // 4. Property Enquiry Dual Dispatch (Investor + Owner)
  async sendPropertyEnquiryDualEmails({ inquiry, property }) {
    const results = {};
    const ownerEmail = config.OWNER_EMAIL || 'taskflow.notification@gmail.com';

    // A. Send to Investor (if email provided)
    if (inquiry.clientEmail) {
      results.investorEmail = await dispatchEmail({
        to: inquiry.clientEmail,
        subject: `📑 Enquiry Acknowledged — ${property.title} | LLB Parandur Advisory Desk`,
        html: buildEnquiryCustomerHtml(inquiry, property),
        type: 'ENQUIRY_CUSTOMER',
        workflow: '06_property_enquiry.json',
        metadata: { inquiryId: inquiry.id, propertyId: property.id }
      });
    }

    // B. Send to Owner / Management
    results.ownerEmail = await dispatchEmail({
      to: ownerEmail,
      subject: `💼 NEW PROPERTY LEAD: ${inquiry.clientName} enquiring about ${property.title}`,
      html: buildEnquiryOwnerAlertHtml(inquiry, property),
      type: 'ENQUIRY_OWNER',
      workflow: '06_property_enquiry.json',
      metadata: { inquiryId: inquiry.id, propertyId: property.id, clientName: inquiry.clientName }
    });

    return results;
  }
};
