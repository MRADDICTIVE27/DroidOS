@echo off
setlocal enabledelayedexpansion
title DroidOS - 1-Click Stream Bot & Workstation
cd /d "%~dp0"
color 0B

echo ===============================================================================
echo                DROIDOS - 1-CLICK DESKTOP STREAM WORKSTATION
echo ===============================================================================
echo.
echo [*] Initializing 1-Click Automated Setup & Launch...
echo.

:: 1. Verify Node.js Environment
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] Node.js was not found in your Windows PATH.
    echo.
    echo [*] Attempting to install Node.js LTS via Windows Package Manager (winget)...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        echo [*] Running: winget install OpenJS.NodeJS.LTS ...
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        echo.
        echo [OK] Node.js has been installed! Please close and reopen this file to refresh Windows PATH.
        pause
        exit /b 0
    ) else (
        echo [!] Please install Node.js (LTS version) from https://nodejs.org/
        echo [*] Opening download page in your default browser...
        start https://nodejs.org/
        pause
        exit /b 1
    )
)

echo [OK] Node.js is ready.
for /f "tokens=*" %%v in ('node -v') do echo     Node.js Version: %%v

:: 2. Auto-install dependencies if missing
if not exist "node_modules" (
    echo.
    echo [!] First-time setup detected: Installing required packages...
    echo [*] This will take approximately 30-60 seconds. Please wait...
    call npm install --no-audit
    if %errorlevel% neq 0 (
        echo [!] Retrying npm install...
        call npm install
    )
    echo [OK] Packages successfully installed!
)

:: 3. Verify local data folders
if not exist "CONFIG_AND_DATA" mkdir "CONFIG_AND_DATA"
if not exist "CONFIG_AND_DATA\1_AUTH_AND_KEYS" mkdir "CONFIG_AND_DATA\1_AUTH_AND_KEYS"
if not exist "CONFIG_AND_DATA\2_BOT_RESPONSES\Bot_Personalities\response_styles" mkdir "CONFIG_AND_DATA\2_BOT_RESPONSES\Bot_Personalities\response_styles"
if not exist "CONFIG_AND_DATA\3_REDEEMS_AND_SOUNDS" mkdir "CONFIG_AND_DATA\3_REDEEMS_AND_SOUNDS"
if not exist "CONFIG_AND_DATA\4_VIEWER_PROFILES" mkdir "CONFIG_AND_DATA\4_VIEWER_PROFILES"

:: 4. Start DroidOS background server
echo.
echo [*] Starting DroidOS server on port 3000...
start "DroidOS Backend Service" /min cmd /c "npm run dev"

:: 5. Intelligent Health Poll - Wait for server to respond before opening browser
echo [*] Waiting for local workstation to initialize on http://localhost:3000 ...

powershell -NoProfile -Command "$ready = $false; for ($i=0; $i -lt 40; $i++) { try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ready = $true; break } } catch { Start-Sleep -Milliseconds 700 } }; if ($ready) { exit 0 } else { exit 1 }"

if %errorlevel% equ 0 (
    echo [OK] DroidOS server is online and healthy!
    echo.
    echo ===============================================================================
    echo   [✓] Workstation UI:       http://localhost:3000
    echo   [✓] OBS Browser Source:   http://localhost:3000/overlay.html (1920x1080)
    echo ===============================================================================
    echo.
    echo [*] Opening DroidOS in your default browser...
    start "" http://localhost:3000
) else (
    echo [!] Server is taking a few extra seconds. Opening browser now...
    start "" http://localhost:3000
)

echo.
echo [INFO] DroidOS is actively running in the background!
echo [INFO] You can keep this window open or minimize it during your stream.
echo.
pause
