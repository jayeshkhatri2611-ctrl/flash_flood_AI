@echo off
echo =====================================================================
echo  AI-Based Flash Flood Early Warning System for Hilly Regions
echo  Smart India Hackathon 2026 - Problem Statement: SIH26192
echo  Organization: Ministry of Home Affairs - Team: DeepCoders
echo =====================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "FlashFlood-AI Backend" cmd /c "%~dp0backend\run_backend.bat"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "FlashFlood-AI Frontend" cmd /c "%~dp0frontend\run_frontend.bat"

ping 127.0.0.1 -n 4 >nul

echo.
echo Application launching in default browser...
start http://localhost:5173
echo.
echo =====================================================================
echo  Backend API Docs: http://localhost:8000/docs
echo  Frontend URL:     http://localhost:5173
echo =====================================================================
