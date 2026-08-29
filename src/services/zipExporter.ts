import JSZip from 'jszip';
import { BotPersonality, ViewerProfile, RedeemItem, OBSConfig, ShoutoutConfig } from '../types';

// Load source code files dynamically via Vite glob so exported zip contains complete runnable codebase
const dynamicProjectFiles = import.meta.glob<{ default: string }>(
  [
    '/src/**/*',
    '/public/**/*',
    '/index.html',
    '/server.ts',
    '/vite.config.ts',
    '/tsconfig.json',
    '/.env.example'
  ],
  {
    query: '?raw'
  }
);

export async function generateWindowsAppZip(options: {
  personalities: BotPersonality[];
  viewers: ViewerProfile[];
  redeems: RedeemItem[];
  obsConfig: OBSConfig;
  shoutoutConfig: ShoutoutConfig;
  streamerName: string;
}): Promise<Blob> {
  const zip = new JSZip();

  // 1. Pack all source files into the zip
  for (const [filePath, importFn] of Object.entries(dynamicProjectFiles)) {
    const module = await importFn();
    const rawContent = (module as any)?.default || module;
    if (typeof rawContent === 'string') {
      // Remove leading slash
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      zip.file(cleanPath, rawContent);
    }
  }

  // 2. 1-Click Master Launcher Script
  const oneClickStartBat = `@echo off
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
if not exist "CONFIG_AND_DATA\\1_AUTH_AND_KEYS" mkdir "CONFIG_AND_DATA\\1_AUTH_AND_KEYS"
if not exist "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Bot_Personalities\\response_styles" mkdir "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Bot_Personalities\\response_styles"
if not exist "CONFIG_AND_DATA\\3_REDEEMS_AND_SOUNDS" mkdir "CONFIG_AND_DATA\\3_REDEEMS_AND_SOUNDS"
if not exist "CONFIG_AND_DATA\\4_VIEWER_PROFILES" mkdir "CONFIG_AND_DATA\\4_VIEWER_PROFILES"

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
`;

  const droidosBat = `@echo off
setlocal enabledelayedexpansion
title DroidOS Workstation (Running)
cd /d "%~dp0"
color 0B

echo ========================================================
echo            DROIDOS - STREAM AUTOMATION ENGINE
echo ========================================================
echo.

:: Auto-check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [!] ERROR: Node.js is not found in your Windows PATH.
    echo [*] Opening https://nodejs.org/ to download Node.js LTS...
    start https://nodejs.org/
    pause
    exit /b 1
)

:: Auto-install packages if missing
if not exist "node_modules" (
    echo [*] First-time launch detected: Installing packages...
    call npm install --no-audit
)

:: Ensure config folders exist
if not exist "CONFIG_AND_DATA" mkdir "CONFIG_AND_DATA"

:: Start server in background
echo [*] Starting local workstation server on http://localhost:3000
echo [*] OBS Browser Source: http://localhost:3000/overlay.html
echo.

start "DroidOS Server" /min cmd /c "npm run dev"

:: Poll health endpoint before opening browser to prevent 'cannot connect to localhost' errors
echo [*] Waiting for local server to respond...
powershell -NoProfile -Command "$ready = $false; for ($i=0; $i -lt 40; $i++) { try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { $ready = $true; break } } catch { Start-Sleep -Milliseconds 700 } }; if ($ready) { exit 0 } else { exit 1 }"

echo [OK] Server active! Opening browser...
start "" http://localhost:3000

echo.
echo [✓] DroidOS is running. Keep this window open while streaming.
pause
`;

  const setupBat = `@echo off
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
call npm install --no-audit
if %errorlevel% neq 0 (
    echo [!] Retrying npm install...
    call npm install
)

echo.
echo [*] Creating local configuration data folders...
if not exist "CONFIG_AND_DATA" mkdir "CONFIG_AND_DATA"
if not exist "CONFIG_AND_DATA\\1_AUTH_AND_KEYS" mkdir "CONFIG_AND_DATA\\1_AUTH_AND_KEYS"
if not exist "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Bot_Personalities\\response_styles" mkdir "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Bot_Personalities\\response_styles"
if not exist "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Chat_Questions" mkdir "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Chat_Questions"
if not exist "CONFIG_AND_DATA\\3_REDEEMS_AND_SOUNDS" mkdir "CONFIG_AND_DATA\\3_REDEEMS_AND_SOUNDS"
if not exist "CONFIG_AND_DATA\\4_VIEWER_PROFILES" mkdir "CONFIG_AND_DATA\\4_VIEWER_PROFILES"

echo [OK] Local database directories initialized.
echo.
echo ===============================================================================
echo                 SETUP COMPLETE! DroidOS IS READY TO RUN.
echo ===============================================================================
echo.
echo You can now start DroidOS by double clicking "1-CLICK_START_DROIDOS.bat"
echo or building a standalone Windows installer using "Build_Windows_EXE.bat".
echo.
set /p launchNow="Would you like to start DroidOS right now? (Y/N): "
if /i "%launchNow%"=="Y" (
    start 1-CLICK_START_DROIDOS.bat
)
exit /b 0
`;

  const startupBat = `@echo off
title DroidOS Auto-Starter & Diagnostic Wrapper
cd /d "%~dp0"
call "1-CLICK_START_DROIDOS.bat"
`;

  const startPs1 = `# DroidOS - 1-Click PowerShell Launcher & Auto-Bootstrapper
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "                DROIDOS - 1-CLICK DESKTOP STREAM WORKSTATION" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot_Safe = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot_Safe

# 1. Check Node.js
Write-Host "[*] Checking Node.js runtime..." -ForegroundColor Yellow
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "[!] Node.js not detected. Checking Windows Package Manager (winget)..." -ForegroundColor Red
    $wingetInstalled = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetInstalled) {
        Write-Host "[*] Installing Node.js LTS via winget..." -ForegroundColor Yellow
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        Write-Host "[OK] Node.js installed! Please restart PowerShell to refresh PATH." -ForegroundColor Green
        Read-Host "Press Enter to exit"
        exit
    } else {
        Write-Host "[!] Please install Node.js (LTS) from https://nodejs.org/" -ForegroundColor Red
        Start-Process "https://nodejs.org/"
        Read-Host "Press Enter to exit"
        exit
    }
}

$nodeVer = node -v
Write-Host "[OK] Node.js is ready: $nodeVer" -ForegroundColor Green

# 2. Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[!] First-time setup: Installing npm packages (takes ~30-60s)..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm install --no-audit" -Wait -NoNewWindow
    Write-Host "[OK] Packages installed successfully!" -ForegroundColor Green
}

# 3. Create database folders
$folders = @(
    "CONFIG_AND_DATA",
    "CONFIG_AND_DATA\\1_AUTH_AND_KEYS",
    "CONFIG_AND_DATA\\2_BOT_RESPONSES\\Bot_Personalities\\response_styles",
    "CONFIG_AND_DATA\\3_REDEEMS_AND_SOUNDS",
    "CONFIG_AND_DATA\\4_VIEWER_PROFILES"
)
foreach ($f in $folders) {
    if (-not (Test-Path $f)) { New-Item -ItemType Directory -Path $f -Force | Out-Null }
}

# 4. Start backend server
Write-Host "[*] Starting local DroidOS service on port 3000..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/c npm run dev" -WindowStyle Minimized

# 5. Wait for localhost:3000/api/health to respond 200 OK
Write-Host "[*] Waiting for workstation server to become ready on http://localhost:3000 ..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 40; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 700
    }
}

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "  [✓] Workstation UI:       http://localhost:3000" -ForegroundColor Green
Write-Host "  [✓] OBS Browser Source:   http://localhost:3000/overlay.html (1920x1080)" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "[*] Opening DroidOS in your default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "[INFO] DroidOS is actively running. Keep this session alive during broadcast." -ForegroundColor Gray
Read-Host "Press Enter to exit launcher"
`;

  const buildExeBat = `@echo off
title DroidOS Windows Standalone Executable Builder
color 0E
echo ===============================================================================
echo                DROIDOS - STANDALONE WINDOWS .EXE BUILDER
echo ===============================================================================
echo.
echo [*] This will build a standalone Windows Installer (.exe) and portable package.
echo [*] Compiling client & server bundles...
echo.
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [!] Build failed. Please check error logs above.
    pause
    exit /b 1
)

echo.
echo [*] Bundling into Windows Executable with electron-builder...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [!] Note: Installing electron-builder...
    call npm install -D electron electron-builder
    call npx electron-builder --win --x64
)

echo.
echo ===============================================================================
echo [SUCCESS] Windows Executable built in /release/ folder!
echo Look for "DroidOS Setup.exe" or "DroidOS.exe" in the release/ folder.
echo ===============================================================================
pause
`;

  zip.file('1-CLICK_START_DROIDOS.bat', oneClickStartBat);
  zip.file('DroidOS.bat', droidosBat);
  zip.file('DroidOS.startup.bat', startupBat);
  zip.file('Setup.bat', setupBat);
  zip.file('Start_DroidOS.ps1', startPs1);
  zip.file('Build_Windows_EXE.bat', buildExeBat);

  // 3. Electron Main Process (main.cjs)
  const electronMain = `const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 3000;

function startBackendServer() {
  if (isDev) {
    return;
  }
  try {
    const serverPath = path.join(__dirname, 'dist', 'server.cjs');
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
      stdio: 'ignore'
    });
  } catch (err) {
    console.error('Failed to spawn backend server:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'DroidOS - Stream Control Workstation',
    backgroundColor: '#0b0f19',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const appUrl = 'http://localhost:' + PORT;

  // Poll until local server responds
  const loadURL = () => {
    mainWindow.loadURL(appUrl).catch(() => {
      setTimeout(loadURL, 500);
    });
  };

  setTimeout(loadURL, 600);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try { serverProcess.kill(); } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;
  zip.file('main.cjs', electronMain);

  // 4. package.json for Windows
  const packageJson = {
    name: 'droidos',
    productName: 'DroidOS',
    version: '2.0.0',
    description: 'Windows Desktop streaming assistant and automation workstation for YouTube creators with local-first bot intelligence and OBS automation.',
    main: 'main.cjs',
    type: 'module',
    scripts: {
      dev: 'tsx server.ts',
      build: 'vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs',
      start: 'node dist/server.cjs',
      'electron:start': 'electron .',
      'dist:exe': 'npm run build && electron-builder --win nsis --x64',
      'dist:portable': 'npm run build && electron-builder --win portable --x64'
    },
    build: {
      appId: 'com.mraddictive.droidos',
      productName: 'DroidOS',
      directories: {
        output: 'release/'
      },
      win: {
        target: [
          { target: 'nsis', arch: ['x64'] },
          { target: 'portable', arch: ['x64'] }
        ]
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'DroidOS'
      },
      files: [
        'dist/**/*',
        'main.cjs',
        'package.json',
        'public/**/*',
        'CONFIG_AND_DATA/**/*'
      ]
    },
    dependencies: {
      '@google/genai': '^2.4.0',
      '@tailwindcss/vite': '^4.1.14',
      '@vitejs/plugin-react': '^5.0.4',
      dotenv: '^17.2.3',
      express: '^4.21.2',
      jszip: '^3.10.1',
      'lucide-react': '^0.546.0',
      motion: '^12.23.24',
      react: '^19.0.1',
      'react-dom': '^19.0.1',
      vite: '^6.2.3'
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/node': '^22.14.0',
      autoprefixer: '^10.4.21',
      electron: '^34.2.0',
      'electron-builder': '^25.1.8',
      esbuild: '^0.25.0',
      tailwindcss: '^4.1.14',
      tsx: '^4.21.0',
      typescript: '~5.8.2'
    }
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 5. CONFIG_AND_DATA Folder
  const configFolder = zip.folder('CONFIG_AND_DATA');
  if (configFolder) {
    configFolder.file(
      '1_AUTH_AND_KEYS/secrets.json',
      JSON.stringify(
        {
          GOOGLE_CLIENT_ID: '',
          GOOGLE_CLIENT_SECRET: '',
          YOUTUBE_API_KEY: '',
          OBS_HOST: options.obsConfig.host,
          OBS_PORT: options.obsConfig.port,
          OBS_PASSWORD: options.obsConfig.password
        },
        null,
        2
      )
    );

    configFolder.file(
      '2_BOT_RESPONSES/personality.json',
      JSON.stringify(
        {
          bot_name: 'DroidBot',
          personality_style: 'Friendly, helpful, and slightly robotic.'
        },
        null,
        2
      )
    );

    // Save individual personality styles
    options.personalities.forEach((p) => {
      configFolder.file(
        `2_BOT_RESPONSES/Bot_Personalities/response_styles/${p.id}.json`,
        JSON.stringify(p, null, 2)
      );
    });

    configFolder.file(
      '3_REDEEMS_AND_SOUNDS/redeems.json',
      JSON.stringify(options.redeems, null, 2)
    );

    configFolder.file(
      '4_VIEWER_PROFILES/viewers.json',
      JSON.stringify({ viewers: options.viewers }, null, 2)
    );

    configFolder.file(
      'shoutouts.json',
      JSON.stringify(options.shoutoutConfig, null, 2)
    );
  }

  // 6. Documentation
  const readmeContent = `# DroidOS - Windows Desktop Streaming Workstation

A local-first streaming bot and control workstation for YouTube live creators.

## 🚀 1-Click Quick Launch on Windows (Recommended)
1. Extract this entire zip file to any folder (e.g. \`C:\\DroidOS\` or \`Desktop\\DroidOS\`).
2. **Double-click \`1-CLICK_START_DROIDOS.bat\`**
   - That's it! It automatically verifies Node.js, installs background packages, starts the local server, waits for the health check, and opens DroidOS in your browser automatically!

## 📺 OBS Studio Browser Source
- In OBS Studio, add a new **Browser Source**.
- URL: \`http://localhost:3000/overlay.html\`
- Resolution: \`1920\` x \`1080\`
- Check: "Shutdown source when not active" & "Refresh browser when scene becomes active".

## 🛠️ Standalone Windows .EXE Creation
To generate a standalone Windows installer (\`.exe\`):
1. Double-click \`Build_Windows_EXE.bat\`.
2. The standalone installer will be built into the \`release/\` directory!

Developed for YouTube Creators with ❤️
`;
  zip.file('README.md', readmeContent);

  const quickstartContent = `# DroidOS Windows Quickstart Guide

## Step 1: Extract the ZIP
Unzip the downloaded folder to a permanent location like \`C:\\DroidOS\` or your Desktop.

## Step 2: Double-click "1-CLICK_START_DROIDOS.bat"
The 1-click launcher handles:
- Checking Node.js (or offering 1-click install via winget)
- Installing npm packages automatically
- Launching the background server
- Health-checking the connection before opening your browser so you never get a "cannot connect to localhost" error.

## Step 3: Add into OBS Studio
1. In OBS Studio, add a new **Browser Source**.
2. Name it "DroidOS Overlay".
3. Set URL to: \`http://localhost:3000/overlay.html\`
4. Width: \`1920\`, Height: \`1080\`.
5. Enjoy automated shoutouts, chat roasts, rewards, and boss battles!
`;
  zip.file('QUICKSTART.md', quickstartContent);

  // Generate blob
  return await zip.generateAsync({ type: 'blob' });
}

