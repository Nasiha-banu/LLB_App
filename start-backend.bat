@echo off
title LLB Real Estate - Backend Server
cd /d "%~dp0\backend"
echo Starting LLB Real Estate Backend on http://localhost:5000 ...
node src\server.js
pause
