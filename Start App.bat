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

REM Open frontend in kiosk mode (full screen: no URL bar, no taskbar)
REM Try Chrome first, then Edge, then default browser
set "URL=http://localhost:5173"
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --disable-infobars --no-first-run %URL%
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk --disable-infobars --no-first-run %URL%
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
  start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk --edge-kiosk-type=fullscreen %URL%
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
  start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --kiosk --edge-kiosk-type=fullscreen %URL%
) else (
  start %URL%
  echo Opened in default browser. For full screen, use the fullscreen button in the app.
)

echo.
echo Done. Frontend: http://localhost:5173 (kiosk / full screen)
echo Close the Backend and Frontend windows when you finish. Press F11 or Escape in browser to exit full screen.
pause
