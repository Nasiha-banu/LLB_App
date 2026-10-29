const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const config = require('./config');
const { router: authRoutes } = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const companyRoutes = require('./routes/companyRoutes');
const automationRoutes = require('./routes/automationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
let io = null;
try {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });
  setupSocket(io);
} catch (e) {
  console.warn('Socket.IO initialization bypassed:', e.message);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Attach io to request object for real-time broadcasts
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount V1 API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1', bookingRoutes); // Handles /api/v1/bookings and /api/v1/enquiries
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/automations', automationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Mount Legacy / Alias Routes for Full Compatibility
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api', bookingRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: config.COMPANY_NAME,
    focus: 'Parandur Greenfield Airport Corridor, Tamil Nadu',
    timestamp: new Date().toISOString(),
    version: '2.0.0-parandur-production',
    n8nStatus: 'integrated'
  });
});

// Root API Catalog
app.get('/api', (req, res) => {
  res.json({
    name: 'LLB Real Estate Full-Stack Mobile API & n8n Engine',
    version: '2.0.0',
    brand: 'LLB REAL ESTATE (Parandur, Tamil Nadu)',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/v1/auth (register, login, refresh, logout, forgot-password, reset-password, verify-email)',
      properties: '/api/v1/properties (search, filter, map, featured, details, favourites)',
      bookings: '/api/v1/bookings (submit booking request, site visit schedule, cancellation request)',
      admin: '/api/v1/admin (stats, bookings review, properties CRUD, n8n logs)',
      company: '/api/v1/company (profile, parandur offices, buying process, services)',
      automations: '/api/v1/automations (n8n execution status, test triggers)'
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

module.exports = { app, server, io };
