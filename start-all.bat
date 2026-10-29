@echo off
title LLB Real Estate - Parandur Airport Corridor Fullstack Mobile & n8n Launcher
echo ========================================================================
echo   🏛️  LLB REAL ESTATE - PARANDUR AIRPORT CORRIDOR LAND DEVELOPMENTS
echo       Theme: Imperial Emerald & Champagne Gold Prestige
echo       Starting Backend API, n8n Automation Engine, and Mobile App
echo ========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting n8n Automation Engine on port 5678...
start "LLB n8n Automation Engine" cmd /k "node n8n-automations\mock-n8n-server.js"

timeout /t 2 /nobreak > nul

echo [2/3] Starting Backend & Real-Time Socket Server on port 5000...
start "LLB Backend API Server" cmd /k "node backend\src\server.js"

timeout /t 2 /nobreak > nul

echo [3/3] Starting Mobile Web Development Server on port 3000...
start "LLB Mobile React App" cmd /k "cd mobile && npm.cmd run dev"

echo.
echo ========================================================================
echo   ✅ ALL SERVICES RUNNING:
echo   📱 Mobile Application Preview:   http://localhost:3000
echo   🏛️ Backend REST API Server:      http://localhost:5000
echo   ⚡ n8n Webhook Engine:           http://localhost:5678
echo ========================================================================
echo.
pause
