const express = require('express');
const router = express.Router();
const db = require('../db');
const n8nService = require('../services/n8nService');

// Middleware to check admin role or admin header
function requireAdmin(req, res, next) {
  // If authenticated via JWT, check role
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  // Allow administrative API secret or standard session for dev/demo dashboard
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret === 'llb-admin-key-2026' || process.env.NODE_ENV !== 'production') {
    return next();
  }
  return res.status(403).json({ error: 'Administrative privileges required.' });
}

// GET /api/v1/admin/stats
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const properties = db.getProperties();
    const bookings = db.getBookings();
    const users = db.getUsers();
    const logs = db.getAutomationLogs();

    const totalPlots = properties.reduce((acc, p) => acc + (p.totalPlots || 1), 0);
    const availablePlots = properties.reduce((acc, p) => acc + (p.availablePlots || 0), 0);
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const siteVisits = bookings.filter(b => b.type === 'SITE_VISIT').length;

    res.json({
      stats: {
        totalListings: properties.length,
        totalPlots,
        availablePlots,
        reservedPlots: totalPlots - availablePlots,
        totalBookings: bookings.length,
        pendingBookings,
        siteVisits,
        registeredUsers: users.length,
        n8nAutomationsTriggered: logs.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/admin/bookings
router.get('/bookings', requireAdmin, (req, res) => {
  try {
    const bookings = db.getBookings();
    const { status, type } = req.query;
    let filtered = bookings;

    if (status && status !== 'all') {
      filtered = filtered.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(b => b.type.toLowerCase() === type.toLowerCase());
    }

    res.json({ count: filtered.length, bookings: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/admin/bookings/:id/status
router.patch('/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'New status is required.' });
    }

    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === req.params.id || b.bookingReference === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    const previousStatus = bookings[index].status;
    bookings[index].status = status;
    bookings[index].adminNotes = adminNotes || bookings[index].adminNotes;
    bookings[index].updatedAt = new Date().toISOString();
    db.saveBookings(bookings);

    // Trigger n8n Booking Status Update email notification
    n8nService.triggerBookingStatusUpdate(bookings[index], previousStatus, adminNotes).catch(err => {
      console.warn('n8n status update trigger error:', err.message);
    });

    res.json({
      message: `Booking #${bookings[index].bookingReference} updated to [${status}]`,
      booking: bookings[index]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/admin/properties
router.post('/properties', requireAdmin, (req, res) => {
  try {
    const newProperty = req.body;
    if (!newProperty.id || !newProperty.title || !newProperty.location) {
      return res.status(400).json({ error: 'Property ID, Title, and Location are required.' });
    }

    const properties = db.getProperties();
    if (properties.some(p => p.id.toLowerCase() === newProperty.id.toLowerCase())) {
      return res.status(400).json({ error: 'A property with this ID already exists.' });
    }

    properties.unshift(newProperty);
    db.saveProperties(properties);

    res.status(201).json({
      message: 'Property created successfully.',
      property: newProperty
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/admin/properties/:id
router.put('/properties/:id', requireAdmin, (req, res) => {
  try {
    const properties = db.getProperties();
    const index = properties.findIndex(p => p.id.toLowerCase() === req.params.id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    properties[index] = { ...properties[index], ...req.body, id: properties[index].id };
    db.saveProperties(properties);

    res.json({
      message: 'Property updated successfully.',
      property: properties[index]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/admin/properties/:id
router.delete('/properties/:id', requireAdmin, (req, res) => {
  try {
    let properties = db.getProperties();
    const initialLen = properties.length;
    properties = properties.filter(p => p.id.toLowerCase() !== req.params.id.toLowerCase());

    if (properties.length === initialLen) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    db.saveProperties(properties);
    res.json({ message: 'Property archived/deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/admin/automation-logs
router.get('/automation-logs', requireAdmin, (req, res) => {
  try {
    const logs = db.getAutomationLogs();
    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/admin/users
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = db.getUsers().map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
