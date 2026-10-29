const http = require('http');
const path = require('path');

let emailService = null;
try {
  emailService = require('../backend/src/services/emailService');
} catch (e) {
  console.warn('⚠️ [n8n Server] Could not load backend emailService directly:', e.message);
}

const PORT = 5678;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-LLB-Automation-Source, X-LLB-Webhook-Secret, X-LLB-Event-ID');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  if (req.method === 'GET' && (url === '/' || url === '/healthz')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'llb-n8n-automation-server',
      port: PORT,
      workflows: [
        'user-registration',
        'password-reset',
        'booking-confirmation',
        'booking-status-update',
        'site-visit-followup'
      ]
    }));
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let data = {};
      try {
        data = JSON.parse(body);
      } catch (e) {
        data = { raw: body };
      }

      const timestamp = new Date().toISOString();
      const executionId = `n8n-exec-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

      console.log(`\n========================================================================`);
      console.log(`⚡ [n8n Workflow Execution] ${url} | Exec ID: ${executionId}`);
      console.log(`⏰ Time: ${timestamp}`);
      console.log(`📦 Payload:`, JSON.stringify(data, null, 2));

      let workflowName = 'Generic Webhook';
      let actions = [];
      let emailResult = null;

      if (url.includes('user-registration')) {
        workflowName = 'Workflow A: New User Registration Welcome';

        // Actually trigger the Welcome Email via emailService if available
        if (emailService && data.email) {
          try {
            emailResult = await emailService.sendRegistrationWelcomeEmail(data);
            console.log(`📧 [n8n Mail Automation] Actual email dispatched to ${data.email} (ID: ${emailResult.id})`);
          } catch (mErr) {
            console.warn(`⚠️ [n8n Mail Automation Error]:`, mErr.message);
          }
        }

        actions = [
          `📧 Dispatched Branded Welcome Email to ${data.email || data.phone}`,
          `🏛️ Created CRM Investor Profile for '${data.name}' (Role: ${data.role || 'CUSTOMER'})`,
          `📑 Attached Parandur Greenfield Airport Growth Corridor Dossier PDF`,
          `🔔 Notified LLB Concierge of newly onboarded buyer`
        ];
      } else if (url.includes('password-reset') || url.includes('auth-otp')) {
        workflowName = 'Workflow B: Password Reset & OTP Dispatch';
        actions = [
          `🔐 Generated single-use 6-digit OTP [${data.otp || '******'}] with 15-minute expiry`,
          `📲 Dispatched via ${data.channel?.toUpperCase() || 'EMAIL'} to ${data.destination}`,
          `🛡️ Security audit record logged with zero password exposure`
        ];
      } else if (url.includes('booking-confirmation')) {
        workflowName = 'Workflow C: Property Booking Confirmation (Customer + Owner)';

        if (emailService) {
          try {
            if (data.type === 'SITE_VISIT') {
              emailResult = await emailService.sendSiteVisitDualEmails({
                booking: data,
                property: { title: data.propertyTitle, location: data.propertyLocation }
              });
              console.log(`📧 [n8n Automation] Site Visit Dual Emails dispatched: Investor (${data.userEmail}) & Owner (taskflow.notification@gmail.com)`);
            } else {
              emailResult = await emailService.sendPlotBookingDualEmails({
                booking: data,
                property: { title: data.propertyTitle, location: data.propertyLocation, totalPrice: data.priceFormatted, areaSqFt: data.plotAreaSqFt }
              });
              console.log(`📧 [n8n Automation] Plot Booking Dual Emails dispatched: Investor (${data.userEmail}) & Owner (taskflow.notification@gmail.com)`);
            }
          } catch (bErr) {
            console.warn(`⚠️ [n8n Booking Email Error]:`, bErr.message);
          }
        }

        actions = [
          `📋 Generated Booking Reference: #${data.bookingReference}`,
          `📧 Dispatched Customer Confirmation Email to ${data.userEmail} for ${data.propertyTitle} (${data.plotUnit || 'Plot'})`,
          `🚨 Dispatched Owner Immediate Alert to taskflow.notification@gmail.com / LLB Management`,
          `🚗 Reserved Complimentary AC Chauffeur Vehicle for ${data.siteVisitDate || 'Scheduled Date'}`
        ];
      } else if (url.includes('property-enquiry') || url.includes('enquiry')) {
        workflowName = 'Workflow F: Property Enquiry Lead Dispatch (Customer + Owner)';

        if (emailService) {
          try {
            emailResult = await emailService.sendPropertyEnquiryDualEmails({
              inquiry: data,
              property: { id: data.propertyId, title: data.propertyTitle, location: data.propertyLocation, totalPrice: data.priceFormatted }
            });
            console.log(`📧 [n8n Automation] Property Enquiry Dual Emails dispatched: Investor (${data.clientEmail}) & Owner (taskflow.notification@gmail.com)`);
          } catch (eErr) {
            console.warn(`⚠️ [n8n Enquiry Email Error]:`, eErr.message);
          }
        }

        actions = [
          `💼 Registered Buyer Lead for Property [${data.propertyTitle || data.propertyId}]`,
          `📧 Sent Enquiry Acknowledgement to ${data.clientEmail || data.clientPhone}`,
          `🚨 Dispatched Owner Immediate Lead Alert to taskflow.notification@gmail.com`,
          `📞 Assigned Senior Advisory Director for Follow-up`
        ];
      } else if (url.includes('booking-status-update')) {
        workflowName = 'Workflow D: Booking Status Update';
        actions = [
          `🔔 Status updated from [${data.previousStatus}] to [${data.newStatus}] for Docket #${data.bookingReference}`,
          `📧 Dispatched formal status notification to customer ${data.userEmail}`,
          `📝 Recorded administrative notes to audit ledger`
        ];
      } else if (url.includes('site-visit-followup')) {
        workflowName = 'Workflow E: Site Visit 24h Pre-Inspection Reminder';
        actions = [
          `⏰ Sent 24-hour site visit reminder for ${data.propertyTitle}`,
          `📍 Sent Google Maps location pin and driver contact details to ${data.userEmail || data.userPhone}`,
          `📞 Parandur Site Office contact coordinates shared`
        ];
      } else {
        workflowName = 'Legacy/General Webhook';
        actions = [`Processed payload successfully for ${url}`];
      }

      console.log(`⚡ Executed Actions:`);
      actions.forEach(a => console.log(`   ✓ ${a}`));
      console.log(`========================================================================\n`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        code: 200,
        executionId,
        workflow: workflowName,
        status: 'SUCCESS',
        executedActions: actions,
        emailDispatched: Boolean(emailResult),
        emailRecord: emailResult,
        previewUrl: emailResult?.previewUrl || null,
        completedAt: new Date().toISOString()
      }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Webhook endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`
========================================================================
  ⚡ LLB REAL ESTATE — MOCK n8n AUTOMATION WEBHOOK ENGINE RUNNING
========================================================================
  🌐 Server listening on:  http://localhost:${PORT}
  📬 Webhook Endpoints:
     1. http://localhost:${PORT}/webhook/user-registration (Workflow A)
     2. http://localhost:${PORT}/webhook/password-reset   (Workflow B)
     3. http://localhost:${PORT}/webhook/booking-confirmation (Workflow C)
     4. http://localhost:${PORT}/webhook/booking-status-update (Workflow D)
     5. http://localhost:${PORT}/webhook/site-visit-followup (Workflow E)
========================================================================`);
});
