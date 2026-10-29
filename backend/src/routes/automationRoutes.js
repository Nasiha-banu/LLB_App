const express = require('express');
const router = express.Router();
const config = require('../config');
const db = require('../db');
const n8nService = require('../services/n8nService');

// GET /api/automations/logs
router.get('/logs', (req, res) => {
  const logs = db.getAutomationLogs();
  res.json({
    total: logs.length,
    n8nBaseUrl: config.N8N_BASE_URL,
    mockFallbackActive: config.N8N_MOCK_FALLBACK,
    logs
  });
});

// GET /api/automations/status
router.get('/status', (req, res) => {
  const logs = db.getAutomationLogs();
  const successful = logs.filter(l => l.status === 'delivered_to_n8n' || l.status === 'simulated_fallback').length;
  const directN8n = logs.filter(l => l.status === 'delivered_to_n8n').length;
  const simulated = logs.filter(l => l.status === 'simulated_fallback').length;

  res.json({
    status: 'online',
    n8nTarget: config.N8N_BASE_URL,
    fallbackMode: config.N8N_MOCK_FALLBACK ? 'Enabled (Fault-Tolerant Simulation)' : 'Strict n8n only',
    stats: {
      totalDispatched: logs.length,
      successful,
      deliveredDirectToN8n: directN8n,
      simulatedFallbacks: simulated
    },
    supportedWorkflows: [
      { name: 'USER_REGISTRATION', webhook: 'user-registration', description: 'Triggers on new client signup via email/phone' },
      { name: 'AUTH_OTP_RESET', webhook: 'auth-otp', description: 'Dispatches 6-digit cryptographic PIN via SMS / SMTP' },
      { name: 'PROPERTY_INQUIRY', webhook: 'property-inquiry', description: 'Routes high-value buyer inquiry to Senior Acquisitions Partner' },
      { name: 'SCHEDULE_TOUR', webhook: 'schedule-tour', description: 'Reserves VIP Mercedes chauffeur and calendar dispatch' },
      { name: 'PRICE_ALERT', webhook: 'price-alert', description: 'Broadcasts price drops and new land listings to subscribed HNIs' }
    ]
  });
});

// POST /api/automations/test
router.post('/test', async (req, res) => {
  try {
    const { workflow, payload } = req.body;

    let result;
    switch (workflow) {
      case 'USER_REGISTRATION':
        result = await n8nService.dispatchUserRegistration(payload || {
          id: 'test-usr-999',
          name: 'Vikramaditya Singhania',
          email: 'singhania@heritage-holdings.in',
          phone: '+919940022334',
          role: 'Ultra-HNI Investor',
          createdAt: new Date().toISOString()
        });
        break;

      case 'AUTH_OTP_RESET':
        result = await n8nService.dispatchOtpNotification(
          payload?.destination || 'investor@llb.com',
          payload?.channel || 'sms',
          payload?.otp || '582910',
          { id: 'test-usr-999', name: 'Vikramaditya Singhania' }
        );
        break;

      case 'PROPERTY_INQUIRY':
        result = await n8nService.dispatchPropertyInquiry(payload || {
          propertyId: 'prop-land-01',
          propertyTitle: 'Neelankarai Coastal Villa Plot (₹15.50 Cr)',
          clientName: 'Vikramaditya Singhania',
          clientEmail: 'singhania@heritage-holdings.in',
          clientPhone: '+919940022334',
          vipLevel: 'Tier 1 Ultra-HNI',
          message: 'Requesting 40-year parent document scrutiny & survey map.'
        });
        break;

      case 'SCHEDULE_TOUR':
        result = await n8nService.dispatchTourBooking(payload || {
          propertyId: 'prop-land-01',
          propertyTitle: 'Neelankarai Coastal Villa Plot',
          clientName: 'Vikramaditya Singhania',
          scheduledDate: '2026-11-02',
          scheduledTime: '11:00 AM',
          requireChauffeur: true,
          pickupAddress: 'Taj Coromandel, Nungambakkam, Chennai'
        });
        break;

      case 'PRICE_ALERT':
        result = await n8nService.dispatchPriceAlert({
          id: 'prop-land-01',
          title: 'Neelankarai Coastal Villa Plot',
          location: 'Neelankarai, ECR, Chennai',
          priceFormatted: '₹15.50 Cr'
        }, '₹14.90 Cr (Special Diwali Window)');
        break;

      default:
        return res.status(400).json({ error: `Unknown workflow: ${workflow}` });
    }

    res.json({
      success: true,
      workflow,
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
