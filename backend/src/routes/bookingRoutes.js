const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const n8nService = require('../services/n8nService');
const emailService = require('../services/emailService');
const { authenticateToken } = require('./authRoutes');

// Helper to generate professional LLB Parandur booking reference
function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `LLB-PRD-${year}-${randomSuffix}`;
}

// POST /api/v1/enquiries
router.post('/enquiries', async (req, res) => {
  try {
    const { propertyId, clientName, clientEmail, clientPhone, message } = req.body;
    if (!propertyId || !clientName || (!clientEmail && !clientPhone)) {
      return res.status(400).json({ error: 'Property ID, name, and contact details are required.' });
    }

    const properties = db.getProperties();
    const property = properties.find(p => p.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const inquiries = db.getInquiries();
    const newInquiry = {
      id: `inq-${uuidv4().substring(0, 8)}`,
      propertyId,
      propertyTitle: property.title,
      clientName: clientName.trim(),
      clientEmail: clientEmail?.trim(),
      clientPhone: clientPhone?.trim(),
      message: message?.trim() || 'Requesting detailed due-diligence legal dossier and survey sketch.',
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    inquiries.unshift(newInquiry);
    db.saveInquiries(inquiries);

    // Trigger n8n Property Enquiry Workflow & Direct Dual Email Dispatch
    let emailResult = null;
    try {
      emailResult = await emailService.sendPropertyEnquiryDualEmails({ inquiry: newInquiry, property });
      n8nService.dispatchWebhook('PROPERTY_ENQUIRY', 'property-enquiry', {
        inquiryId: newInquiry.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        clientName: newInquiry.clientName,
        clientEmail: newInquiry.clientEmail,
        clientPhone: newInquiry.clientPhone,
        message: newInquiry.message,
        createdAt: newInquiry.createdAt
      }).catch(wErr => console.warn('n8n enquiry webhook error:', wErr.message));
    } catch (eErr) {
      console.warn('Enquiry dual email dispatch error:', eErr.message);
    }

    res.status(201).json({
      message: 'Enquiry submitted successfully. Confirmation email sent to investor and high-priority lead alert dispatched to property owner.',
      inquiry: newInquiry,
      emailDispatched: Boolean(emailResult),
      dualEmailDetails: {
        investorEmail: newInquiry.clientEmail,
        ownerEmail: 'taskflow.notification@gmail.com',
        status: 'DISPATCHED'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookings (Schedule Site Visit or Submit Plot Booking Request)
router.post('/bookings', async (req, res) => {
  try {
    const {
      propertyId,
      type = 'PLOT_BOOKING', // 'PLOT_BOOKING' or 'SITE_VISIT'
      plotUnit,
      userName,
      userEmail,
      userPhone,
      siteVisitDate,
      siteVisitTime,
      notes,
      termsAccepted,
      idempotencyKey
    } = req.body;

    if (!propertyId || !userName || (!userEmail && !userPhone)) {
      return res.status(400).json({
        error: 'Property ID, user name, and at least one contact channel (email/phone) are required.'
      });
    }

    const bookings = db.getBookings();

    // Idempotency check: prevent accidental double-clicks or duplicate network retries
    if (idempotencyKey) {
      const existing = bookings.find(b => b.idempotencyKey === idempotencyKey);
      if (existing) {
        return res.json({
          message: 'Booking request already recorded (idempotent submission).',
          booking: existing
        });
      }
    }

    const properties = db.getProperties();
    const property = properties.find(p => p.id.toLowerCase() === propertyId.toLowerCase());
    if (!property) {
      return res.status(404).json({ error: 'Property not found in catalog.' });
    }

    const bookingReference = generateBookingReference();

    const newBooking = {
      id: `bk-${uuidv4().substring(0, 8)}`,
      bookingReference,
      idempotencyKey: idempotencyKey || null,
      type: type === 'SITE_VISIT' ? 'SITE_VISIT' : 'PLOT_BOOKING',
      status: 'Pending',
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      plotUnit: plotUnit || property.plotsList?.[0] || 'Plot Unit',
      plotAreaSqFt: property.areaSqFt,
      priceFormatted: property.totalPrice,
      userName: userName.trim(),
      userEmail: userEmail?.trim().toLowerCase(),
      userPhone: userPhone?.trim(),
      siteVisitDate: siteVisitDate || null,
      siteVisitTime: siteVisitTime || '10:00 AM',
      notes: notes?.trim() || '',
      termsAccepted: Boolean(termsAccepted),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    db.saveBookings(bookings);

    // Trigger n8n Booking Confirmation Workflow & Direct Dual Email Dispatch
    let emailResult = null;
    try {
      if (newBooking.type === 'SITE_VISIT') {
        emailResult = await emailService.sendSiteVisitDualEmails({ booking: newBooking, property });
      } else {
        emailResult = await emailService.sendPlotBookingDualEmails({ booking: newBooking, property });
      }
    } catch (mErr) {
      console.warn('Booking dual email dispatch error:', mErr.message);
    }

    n8nService.triggerBookingConfirmation(newBooking, property).catch(err => {
      console.warn('n8n booking trigger error:', err.message);
    });

    res.status(201).json({
      message: newBooking.type === 'SITE_VISIT'
        ? 'Executive Site Visit scheduled. Chauffeur confirmation dispatched to investor & driver dispatch alert sent to property owner.'
        : 'Plot reservation submitted. Official booking docket sent to investor & urgent booking alert dispatched to property owner.',
      bookingReference,
      booking: newBooking,
      emailDispatched: Boolean(emailResult),
      dualEmailDetails: {
        investorEmail: newBooking.userEmail,
        ownerEmail: 'taskflow.notification@gmail.com',
        type: newBooking.type,
        status: 'DISPATCHED'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/bookings/my (Customer's own bookings)
router.get('/bookings/my', (req, res) => {
  try {
    const { email, phone } = req.query;
    const authHeader = req.headers['authorization'];
    let userEmail = email;

    // Check JWT if present
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const config = require('../config');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded?.email) userEmail = decoded.email;
      } catch (e) {
        // Continue with query params
      }
    }

    const bookings = db.getBookings();
    if (!userEmail && !phone) {
      // If neither is provided, return recent bookings for demo view
      return res.json({ count: bookings.length, bookings });
    }

    const filtered = bookings.filter(b => {
      if (userEmail && b.userEmail && b.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      if (phone && b.userPhone && b.userPhone.includes(phone)) return true;
      return false;
    });

    res.json({ count: filtered.length, bookings: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/bookings/:id
router.get('/bookings/:id', (req, res) => {
  try {
    const bookings = db.getBookings();
    const booking = bookings.find(b => b.id === req.params.id || b.bookingReference === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookings/:id/cancellation-request
router.post('/bookings/:id/cancellation-request', async (req, res) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === req.params.id || b.bookingReference === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const previousStatus = bookings[index].status;
    bookings[index].status = 'Cancellation Requested';
    bookings[index].cancellationReason = reason;
    bookings[index].updatedAt = new Date().toISOString();
    db.saveBookings(bookings);

    // Trigger n8n Booking Status Update Workflow
    n8nService.triggerBookingStatusUpdate(bookings[index], previousStatus, reason).catch(err => {
      console.warn('n8n status update error:', err.message);
    });

    res.json({
      message: 'Cancellation request recorded. An advisor will contact you to process confirmation.',
      booking: bookings[index]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
