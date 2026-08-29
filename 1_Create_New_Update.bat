@echo off
title DroidOS Auto-Updater Builder
color 0B

echo ==========================================================
echo        DROIDOS VERSION BUMPER ^& BUILDER
echo ==========================================================
echo.
echo Current version in package.json is:
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Get-Content -Raw -Path 'package.json' | ConvertFrom-Json).version"') do set CURRENT_VER=%%a
echo v%CURRENT_VER%
echo.
set /p newver="Type the NEW version number (e.g. 2.0.1) and press Enter: "
echo.
echo [*] Updating package.json to version %newver%...
call npm version %newver% --no-git-tag-version
if %errorlevel% neq 0 (
    echo [!] Failed to update version in package.json. Make sure you typed a valid format like 2.0.1
    pause
    exit /b 1
)

echo.
echo [*] Running the main Windows packager...
call release\Build_Windows_EXE.bat

echo.
echo ==========================================================
echo [ALL DONE!] 
echo You can now go to your 'release' folder and upload:
echo 1. DroidOS_Setup_v%newver%.exe
echo 2. latest.yml 
echo ...to your GitHub Releases page to push the auto-update!
echo ==========================================================
pause
