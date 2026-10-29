@echo off
title LLB Real Estate - n8n Webhook Engine
cd /d "%~dp0\n8n-automations"
echo Starting n8n Webhook Engine on http://localhost:5678 ...
node mock-n8n-server.js
pause
