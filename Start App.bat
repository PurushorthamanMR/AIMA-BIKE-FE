@echo off
title AIMA-BIKE Launcher
cd /d "%~dp0"

echo Starting AIMA-BIKE...
echo.

REM Start Backend (sibling folder AIMA-BIKE-BE)
start "AIMA-BIKE Backend" cmd /k "cd /d "%~dp0..\AIMA-BIKE-BE" && npm start"

REM Start Frontend (this folder)
start "AIMA-BIKE Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo Backend and Frontend are starting...
echo.
echo Browser will open in 8 seconds (frontend needs time to start).
timeout /t 8 /nobreak >nul

REM Open frontend in default browser (Vite default port 5173)
start http://localhost:5173

echo.
echo Done. Frontend: http://localhost:5173
echo Close the Backend and Frontend windows when you finish.
pause
