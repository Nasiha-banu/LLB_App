require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'llb-parandur-realestate-secure-jwt-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // n8n Webhook Configuration
  N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678/webhook',
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET || 'llb-n8n-webhook-secret-parandur-2026',
  N8N_MOCK_FALLBACK: process.env.N8N_MOCK_FALLBACK !== 'false',

  // Email / SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER || 'taskflow.notification@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'yjrmgzksmxdawbmo',
  SMTP_FROM: process.env.SMTP_FROM || 'LLB Real Estate Chennai <taskflow.notification@gmail.com>',
  OWNER_EMAIL: process.env.OWNER_EMAIL || 'taskflow.notification@gmail.com',
  ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL || 'taskflow.notification@gmail.com',

  // Brand Coordinates & Offices
  COMPANY_NAME: 'LLB Real Estate',
  COMPANY_TAGLINE: 'Parandur Greenfield Airport Land & Plot Specialists',
  COMPANY_HEADQUARTERS: 'LLB Towers, No. 48 Gandhi Road, Near Parandur Link, Kanchipuram, Tamil Nadu - 631501',
  PARANDUR_SITE_OFFICE: 'Aero Vista Hub, NH-48 Parandur Junction, Sunguvarchatram, Tamil Nadu - 631552',
  CONTACT_PHONE: '+91 94441 23456',
  CONTACT_WHATSAPP: '+91 94441 23456',
  CONTACT_TOLLFREE: '1800 572 8990',
  CONTACT_EMAIL: 'concierge@llbrealestate.com',
  RERA_NUMBER: 'TN/AGENT/0892/2024',
  DTCP_LICENSE: 'DTCP/REG/KPM/2023/104',
  MAP_DEFAULT_CENTER: {
    lat: 12.9885,
    lng: 79.7642,
    zoom: 12,
    locationName: 'Parandur Greenfield Airport Corridor, Tamil Nadu'
  }
};
