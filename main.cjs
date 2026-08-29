const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 3000;

// Check if a port is already in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))   // port is taken
      .once('listening', () => {
        tester.close();
        resolve(false); // port is free
      })
      .listen(port, '127.0.0.1');
  });
}

async function startBackendServer() {
  if (isDev) return;

  const inUse = await isPortInUse(PORT);
  if (inUse) {
    // Port already occupied — check if it's our own server
    console.log('[DroidOS] Port 3000 already in use — checking if DroidOS server is already running...');
    return; // Let waitForServerThenLoad handle it — it will connect to the existing server
  }

  try {
    process.env.PORT = String(PORT);
    process.env.NODE_ENV = 'production';
    process.env.APP_DATA_PATH = app.getPath('userData');
    require('./dist/server.cjs');
    console.log('[DroidOS] Backend server started.');
  } catch (err) {
    console.error('[DroidOS] Failed to start backend server:', err);
  }
}

// Poll until the local server responds, then load the UI
function waitForServerThenLoad(win, url, maxAttempts = 60, interval = 500) {
  let attempts = 0;
  let hasLoaded = false;

  function attempt() {
    if (hasLoaded || !win || win.isDestroyed()) return;

    const req = http.get(url + '/api/health', (res) => {
      res.resume(); // consume response to free socket
      if (res.statusCode === 200) {
        if (hasLoaded) return;
        hasLoaded = true;
        console.log('[DroidOS] Server ready. Loading UI...');
        win.loadURL(url).catch(() => {
          setTimeout(() => {
            if (!win.isDestroyed()) win.loadURL(url).catch(console.error);
          }, 1000);
        });
      } else {
        retry();
      }
    });

    req.on('error', retry);
    req.setTimeout(1000, () => {
      req.destroy();
      retry();
    });
  }

  function retry() {
    if (hasLoaded) return;
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(attempt, interval);
    } else {
      hasLoaded = true;
      console.error('[DroidOS] Server did not respond in time — loading anyway.');
      if (!win.isDestroyed()) win.loadURL(url).catch(console.error);
    }
  }

  setTimeout(attempt, 500);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'DroidOS - Stream Control Workstation',
    backgroundColor: '#0b0f19',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools();
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    if (level > 0) console.log('[Renderer] ' + message); // only warnings/errors
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://accounts.google.com')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  waitForServerThenLoad(mainWindow, 'http://localhost:' + PORT);
}

app.whenReady().then(async () => {
  await startBackendServer();
  createWindow();

  if (!isDev) {
    try {
      autoUpdater.checkForUpdatesAndNotify();
      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Ready',
          message: 'A new version of DroidOS has been downloaded.',
          detail: 'The app will restart to install the update.',
          buttons: ['Update Now']
        }).then(() => autoUpdater.quitAndInstall());
      });
    } catch (e) {
      console.warn('[DroidOS] Auto-updater not available:', e.message);
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-data-folder', () => {
  shell.openPath(path.join(app.getPath('userData'), 'data'));
});
