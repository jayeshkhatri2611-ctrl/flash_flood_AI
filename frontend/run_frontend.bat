@echo off
title FlashFlood-AI Frontend (Port 5173)
cd /d "%~dp0"
echo Starting Vite Frontend on port 5173...
call npm.cmd run dev
pause
