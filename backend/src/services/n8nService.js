const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const db = require('../db');

/**
 * Dispatches an event payload to an n8n webhook endpoint with fallback simulation
 */
async function dispatchWebhook(workflowName, webhookPath, payload) {
  const logId = uuidv4();
  const timestamp = new Date().toISOString();
  const url = `${config.N8N_BASE_URL}/${webhookPath}`;

  const logEntry = {
    id: logId,
    workflow: workflowName,
    webhookPath,
    targetUrl: url,
    timestamp,
    payload,
    status: 'pending',
    response: null,
    latencyMs: 0
  };

  const startTime = Date.now();

  try {
    const res = await axios.post(url, payload, {
      timeout: 3500,
      headers: {
        'Content-Type': 'application/json',
        'X-LLB-Automation-Source': 'llb-mobile-backend',
        'X-LLB-Webhook-Secret': config.N8N_WEBHOOK_SECRET,
        'X-LLB-Event-ID': logId
      }
    });

    logEntry.latencyMs = Date.now() - startTime;
    logEntry.status = 'delivered_to_n8n';
    logEntry.httpStatus = res.status;
    logEntry.response = res.data;
    console.log(`⚡ [n8n Automation] Dispatched '${workflowName}' to ${url} (HTTP ${res.status})`);
  } catch (err) {
    logEntry.latencyMs = Date.now() - startTime;

    if (config.N8N_MOCK_FALLBACK) {
      logEntry.status = 'simulated_fallback';
      logEntry.simulated = true;
      logEntry.errorReason = err.code || err.message;
      logEntry.response = generateSimulatedResponse(workflowName, payload);
      console.log(`ℹ️ [n8n Automation] '${workflowName}' local simulation active: response logged.`);
    } else {
      logEntry.status = 'failed';
      logEntry.error = err.message;
      console.error(`❌ [n8n Automation] Failed to dispatch '${workflowName}':`, err.message);
    }
  }

  // Save to persistent database
  const logs = db.getAutomationLogs();
  logs.unshift(logEntry);
  if (logs.length > 200) logs.pop();
  db.saveAutomationLogs(logs);

  return logEntry;
}

function generateSimulatedResponse(workflow, payload) {
  switch (workflow) {
    case 'USER_REGISTRATION':
      return {
        success: true,
        workflowId: 'n8n-wf-01-welcome',
        message: `Welcome package email dispatched to ${payload.email || payload.phone}`,
        recipient: payload.email,
        actionsExecuted: [
          'Validated client credentials and Indian mobile format',
          'Formatted branded LLB Real Estate HTML welcome letter',
          'Attached Parandur Greenfield Airport Growth Corridor Report PDF',
          'Created CRM Investor profile and scheduled concierge outreach'
        ]
      };

    case 'PASSWORD_RESET_OTP':
      return {
        success: true,
        workflowId: 'n8n-wf-02-password-reset',
        message: `Expiring OTP/Reset link delivered to ${payload.destination}`,
        deliveryTrackingId: `MSG-${Date.now().toString(36).toUpperCase()}`,
        expiresInMinutes: 15,
        actionsExecuted: [
          'Generated single-use 6-digit cryptographic OTP',
          'Enforced 15-minute expiration window',
          'Dispatched branded reset email via SMTP',
          'Recorded delivery status with zero plaintext credentials exposed'
        ]
      };

    case 'BOOKING_CONFIRMATION':
      return {
        success: true,
        workflowId: 'n8n-wf-03-booking-confirmation',
        bookingReference: payload.bookingReference,
        customerEmailStatus: `Dispatched to ${payload.userEmail}`,
        adminEmailStatus: `Alert sent to admin@llb.com (${config.CONTACT_EMAIL})`,
        actionsExecuted: [
          `Locked plot reservation request for ${payload.plotUnit || 'Land Parcel'}`,
          `Generated formal booking docket #${payload.bookingReference}`,
          'Sent customer booking confirmation with inspection terms',
          'Notified LLB Parandur Site Director via high-priority email alert',
          'Reserved complimentary AC chauffeur inspection vehicle'
        ]
      };

    case 'BOOKING_STATUS_UPDATE':
      return {
        success: true,
        workflowId: 'n8n-wf-04-status-update',
        bookingReference: payload.bookingReference,
        newStatus: payload.newStatus,
        message: `Status notification delivered to ${payload.userEmail}`,
        actionsExecuted: [
          `Updated booking state to [${payload.newStatus}]`,
          'Generated formal status dispatch notification',
          'Logged to administrative audit ledger',
          'Updated mobile customer dashboard push feed'
        ]
      };

    case 'SITE_VISIT_FOLLOWUP':
      return {
        success: true,
        workflowId: 'n8n-wf-05-followup',
        bookingReference: payload.bookingReference,
        message: `Site visit reminder scheduled for ${payload.siteVisitDate}`,
        actionsExecuted: [
          'Calculated 24h pre-inspection countdown',
          'Checked client communication consent',
          'Dispatched chauffeur pickup details & Google Maps location pin',
          'Provided LLB Parandur Site Office contact coordinates'
        ]
      };

    default:
      return {
        success: true,
        workflow,
        dispatchedAt: new Date().toISOString()
      };
  }
}

module.exports = {
  dispatchWebhook,
  
  // Workflow A: New User Registration
  triggerRegistrationWelcome: (user) => {
    return dispatchWebhook('USER_REGISTRATION', 'user-registration', {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      registrationSource: 'LLB Mobile App (iOS / Android)',
      registeredAt: user.createdAt
    });
  },

  // Workflow B: Password Reset & OTP
  triggerPasswordReset: (destination, channel, otp, resetToken, user = null) => {
    return dispatchWebhook('PASSWORD_RESET_OTP', 'password-reset', {
      destination,
      channel, // 'email' or 'sms'
      otp,
      resetToken,
      resetUrl: `https://llbrealestate.com/auth/reset?token=${resetToken}`,
      userId: user?.id,
      userName: user?.name || 'Valued Client',
      purpose: 'PASSWORD_RESET',
      requestedAt: new Date().toISOString()
    });
  },

  // Workflow C: Property Booking Confirmation (Customer + Admin)
  triggerBookingConfirmation: (booking, property) => {
    return dispatchWebhook('BOOKING_CONFIRMATION', 'booking-confirmation', {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      type: booking.type,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      plotUnit: booking.plotUnit || 'Selected Plot',
      plotAreaSqFt: property.areaSqFt,
      priceFormatted: property.totalPrice,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      siteVisitDate: booking.siteVisitDate,
      siteVisitTime: booking.siteVisitTime,
      notes: booking.notes,
      bookingStatus: booking.status,
      adminDashboardUrl: `https://llbrealestate.com/admin/bookings/${booking.id}`,
      submittedAt: booking.createdAt
    });
  },

  // Workflow D: Booking Status Update
  triggerBookingStatusUpdate: (booking, previousStatus, adminNotes = '') => {
    return dispatchWebhook('BOOKING_STATUS_UPDATE', 'booking-status-update', {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      previousStatus,
      newStatus: booking.status,
      propertyTitle: booking.propertyTitle,
      plotUnit: booking.plotUnit,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      adminNotes,
      updatedAt: new Date().toISOString()
    });
  },

  // Workflow E: Site Visit Follow-up
  triggerSiteVisitFollowup: (booking) => {
    return dispatchWebhook('SITE_VISIT_FOLLOWUP', 'site-visit-followup', {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      propertyTitle: booking.propertyTitle,
      propertyLocation: booking.propertyLocation,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      siteVisitDate: booking.siteVisitDate,
      siteVisitTime: booking.siteVisitTime,
      officeContact: config.CONTACT_PHONE,
      sentAt: new Date().toISOString()
    });
  }
};
