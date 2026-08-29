@echo off
title DroidOS Setup & Installation Assistant
color 0B
echo ===============================================================================
echo                DROIDOS - WINDOWS DESKTOP STREAM BOT SETUP
echo ===============================================================================
echo.
echo [*] Checking Node.js environment on Windows...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] ERROR: Node.js was not found in your Windows PATH!
    echo [*] Please download and install Node.js (LTS version) from:
    echo     https://nodejs.org/
    echo.
    echo Press any key to open the Node.js website in your browser...
    pause >nul
    start https://nodejs.org/
    exit /b 1
)

node -v
echo [OK] Node.js is ready.
echo.
echo [*] Installing local dependencies for DroidOS...
call npm install --no-audit --prefer-offline
if %errorlevel% neq 0 (
    echo [!] Warning: Retrying standard npm install...
    call npm install
)

echo.
echo [*] Initializing local database folders...
if not exist "CONFIG_AND_DATA" mkdir "CONFIG_AND_DATA"
if not exist "CONFIG_AND_DATA\1_AUTH_AND_KEYS" mkdir "CONFIG_AND_DATA\1_AUTH_AND_KEYS"
if not exist "CONFIG_AND_DATA\2_BOT_RESPONSES\Bot_Personalities\response_styles" mkdir "CONFIG_AND_DATA\2_BOT_RESPONSES\Bot_Personalities\response_styles"
if not exist "CONFIG_AND_DATA\2_BOT_RESPONSES\Chat_Questions" mkdir "CONFIG_AND_DATA\2_BOT_RESPONSES\Chat_Questions"
if not exist "CONFIG_AND_DATA\3_REDEEMS_AND_SOUNDS" mkdir "CONFIG_AND_DATA\3_REDEEMS_AND_SOUNDS"
if not exist "CONFIG_AND_DATA\4_VIEWER_PROFILES" mkdir "CONFIG_AND_DATA\4_VIEWER_PROFILES"

echo [OK] Local database directories initialized.
echo.
echo ===============================================================================
echo                 SETUP COMPLETE! DroidOS IS READY TO RUN.
echo ===============================================================================
echo.
echo You can now start DroidOS by double-clicking "DroidOS.bat"
echo or building a standalone Windows installer using "Build_Windows_EXE.bat".
echo.
set /p launchNow="Would you like to start DroidOS right now? (Y/N): "
if /i "%launchNow%"=="Y" (
    start DroidOS.bat
)
exit /b 0
