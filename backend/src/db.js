const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REFRESH_TOKENS_FILE = path.join(DATA_DIR, 'refresh_tokens.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const AUTOMATION_LOGS_FILE = path.join(DATA_DIR, 'automation_logs.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');

function readJson(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    return defaultValue;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
    return false;
  }
}

// Seed default demo accounts and initial bookings
function initDatabase() {
  const users = readJson(USERS_FILE, []);
  if (users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const demoUsers = [
      {
        id: 'usr-admin-01',
        name: 'LLB Administrator',
        email: 'admin@llb.com',
        phone: '+919884099881',
        passwordHash: bcrypt.hashSync('Admin@123', salt),
        role: 'ADMIN',
        verifiedEmail: true,
        verifiedPhone: true,
        favorites: ['LLB-PRD-01', 'LLB-PRD-03'],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-demo-01',
        name: 'Sundar Ramanathan',
        email: 'investor@llb.com',
        phone: '+919876543210',
        passwordHash: bcrypt.hashSync('Password@123', salt),
        role: 'CUSTOMER',
        verifiedEmail: true,
        verifiedPhone: true,
        favorites: ['LLB-PRD-01', 'LLB-PRD-05'],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-demo-02',
        name: 'Priya Meenakshi',
        email: 'priya@chennai.com',
        phone: '+919840112233',
        passwordHash: bcrypt.hashSync('Password@123', salt),
        role: 'CUSTOMER',
        verifiedEmail: true,
        verifiedPhone: true,
        favorites: ['LLB-PRD-03'],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];
    writeJson(USERS_FILE, demoUsers);
    console.log('✅ Initialized demo accounts in database');
  }

  // Seed sample booking for investor if empty
  const bookings = readJson(BOOKINGS_FILE, []);
  if (bookings.length === 0) {
    const demoBookings = [
      {
        id: 'bk-demo-001',
        bookingReference: 'LLB-PRD-2026-4891',
        type: 'PLOT_BOOKING',
        status: 'Pending',
        propertyId: 'LLB-PRD-01',
        propertyTitle: 'Parandur Airport City Phase 1',
        propertyLocation: 'Parandur Airport North Gate Corridor, Kanchipuram - 631552',
        plotUnit: 'Plot #15',
        plotAreaSqFt: 1500,
        priceFormatted: '₹21,75,000',
        userName: 'Sundar Ramanathan',
        userEmail: 'investor@llb.com',
        userPhone: '+919876543210',
        siteVisitDate: '2026-11-05',
        siteVisitTime: '10:30 AM',
        notes: 'Interested in acquiring adjacent plots #15 and #16 for family compound. Require legal dossier.',
        termsAccepted: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'bk-demo-002',
        bookingReference: 'LLB-PRD-2026-7734',
        type: 'SITE_VISIT',
        status: 'Approved',
        propertyId: 'LLB-PRD-03',
        propertyTitle: 'Thandalam Junction Greenfield Villa Enclave',
        propertyLocation: 'Thandalam-Parandur Link Road, Near Saveetha Nagar',
        plotUnit: 'Plot #09',
        plotAreaSqFt: 1800,
        priceFormatted: '₹33,30,000',
        userName: 'Sundar Ramanathan',
        userEmail: 'investor@llb.com',
        userPhone: '+919876543210',
        siteVisitDate: '2026-10-30',
        siteVisitTime: '02:00 PM',
        notes: 'Chauffeur pickup requested from Guindy, Chennai.',
        termsAccepted: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
    writeJson(BOOKINGS_FILE, demoBookings);
  }

  // Ensure other files exist
  readJson(REFRESH_TOKENS_FILE, []);
  readJson(OTPS_FILE, []);
  readJson(INQUIRIES_FILE, []);
  readJson(AUTOMATION_LOGS_FILE, []);
  readJson(AUDIT_LOGS_FILE, []);
}

initDatabase();

module.exports = {
  getUsers: () => readJson(USERS_FILE, []),
  saveUsers: (users) => writeJson(USERS_FILE, users),
  
  getRefreshTokens: () => readJson(REFRESH_TOKENS_FILE, []),
  saveRefreshTokens: (tokens) => writeJson(REFRESH_TOKENS_FILE, tokens),

  getOtps: () => readJson(OTPS_FILE, []),
  saveOtps: (otps) => writeJson(OTPS_FILE, otps),
  
  getInquiries: () => readJson(INQUIRIES_FILE, []),
  saveInquiries: (inquiries) => writeJson(INQUIRIES_FILE, inquiries),
  
  getBookings: () => readJson(BOOKINGS_FILE, []),
  saveBookings: (bookings) => writeJson(BOOKINGS_FILE, bookings),

  getProperties: () => readJson(PROPERTIES_FILE, []),
  saveProperties: (properties) => writeJson(PROPERTIES_FILE, properties),

  getAutomationLogs: () => readJson(AUTOMATION_LOGS_FILE, []),
  saveAutomationLogs: (logs) => writeJson(AUTOMATION_LOGS_FILE, logs),

  getAuditLogs: () => readJson(AUDIT_LOGS_FILE, []),
  saveAuditLogs: (logs) => writeJson(AUDIT_LOGS_FILE, logs)
};
