@echo off
title FlashFlood-AI Backend (Port 8000)
cd /d "%~dp0"
set "PYTHON_CMD=C:\Users\jayesh khatri\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if not exist "%PYTHON_CMD%" (
    set "PYTHON_CMD=python"
)
echo Starting FastAPI Backend with: %PYTHON_CMD%
"%PYTHON_CMD%" -m uvicorn main:app --port 8000 --host 127.0.0.1
pause
