const path = require('path');
const fs = require('fs');
const express = require('express');
const config = require('./config');
const { app, server } = require('./app');

// Serve Mobile App build if available
const mobileDistPath = path.join(__dirname, '..', '..', 'mobile', 'dist');
if (fs.existsSync(mobileDistPath)) {
  app.use(express.static(mobileDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(mobileDistPath, 'index.html'));
  });
}

// Start HTTP & WebSocket Server
server.listen(config.PORT, () => {
  console.log(`
========================================================================
  🏛️  LLB REAL ESTATE MOBILE BACKEND & AUTOMATION ENGINE ONLINE
========================================================================
  📍 Geographic Specialty: Parandur Greenfield Airport, Tamil Nadu
  🌐 Server listening on:  http://localhost:${config.PORT}
  🔑 Auth Endpoints:       http://localhost:${config.PORT}/api/v1/auth
  🏡 Properties API:        http://localhost:${config.PORT}/api/v1/properties
  📋 Bookings API:          http://localhost:${config.PORT}/api/v1/bookings
  ⚡ n8n Automations:      http://localhost:${config.PORT}/api/v1/automations
  🛡️ Admin Console API:    http://localhost:${config.PORT}/api/v1/admin
  🔌 Real-time Socket:     ws://localhost:${config.PORT}
========================================================================`);
});
