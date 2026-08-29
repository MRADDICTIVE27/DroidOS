import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory runtime state (persisted across live session)
const overlayAlerts: Array<{
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  customMessage?: string;
  bannerPreset?: string;
  gameId?: string;
  outcome?: string;
  durationMs?: number;
  timestamp: number;
}> = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'win32-compatible' });
});

app.get('/api/status', (req, res) => {
  res.json({
    app: 'DroidOS',
    version: '2.0.0',
    status: 'online',
    isDesktopReady: true,
    obsOverlayUrl: `http://localhost:${PORT}/overlay.html`
  });
});

// Overlay alerts queue for OBS Studio browser source
app.get('/api/overlay/alerts', (req, res) => {
  const since = parseInt(req.query.since as string, 10) || 0;
  const recent = overlayAlerts.filter((a) => a.timestamp > since);
  res.json({ alerts: recent });
});

app.post('/api/overlay-event', (req, res) => {
  const alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: req.body.type || 'alert',
    title: req.body.data?.title || req.body.title || 'DroidOS Event',
    subtitle: req.body.data?.subtitle || req.body.subtitle || '',
    customMessage: req.body.data?.customMessage || '',
    timestamp: Date.now()
  };
  overlayAlerts.push(alert);
  if (overlayAlerts.length > 50) overlayAlerts.shift();
  res.json({ success: true, alert });
});

app.post('/api/send-bot-chat', (req, res) => {
  const { message, botAccountName, botChannelHandle, sendAsBot } = req.body;
  console.log(`[DroidOS Bot Broadcast] Sent as "${botAccountName}" (${botChannelHandle}): ${message}`);
  res.json({
    success: true,
    sender: botAccountName || 'DroidBot',
    channel: botChannelHandle || '@DroidBotLive',
    message,
    sentViaSeparateAccount: !!sendAsBot
  });
});

app.post('/api/auto-find-host', (req, res) => {
  const { loginEmail, streamKey } = req.body;
  res.json({
    success: true,
    channelName: 'MRADDICTIVE',
    channelHandle: '@MRADDICTIVE',
    channelId: 'UC_MRADDICTIVE_HOST_01',
    subscriberCount: 28400,
    loginEmail: loginEmail || 'streamer@mradictive.live'
  });
});

app.post('/api/overlay/trigger', (req, res) => {
  const alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: req.body.type || 'achievement',
    title: req.body.title || 'DroidOS Notification',
    subtitle: req.body.subtitle || '',
    customMessage: req.body.customMessage || '',
    bannerPreset: req.body.bannerPreset || 'generic',
    gameId: req.body.gameId,
    outcome: req.body.outcome,
    durationMs: req.body.durationMs || 5000,
    timestamp: Date.now()
  };
  overlayAlerts.push(alert);
  // Keep last 50 alerts in memory
  if (overlayAlerts.length > 50) {
    overlayAlerts.shift();
  }
  res.json({ success: true, alert });
});

import fs from 'fs';

// Data sync logic
const getAppRoot = () => {
  // If run via electron portable, process.env.PORTABLE_EXECUTABLE_DIR points to the dir with the exe
  if (process.env.PORTABLE_EXECUTABLE_DIR) return process.env.PORTABLE_EXECUTABLE_DIR;
  if (process.env.APP_DATA_PATH) return process.env.APP_DATA_PATH;
  return process.cwd();
};

const dataDir = path.join(getAppRoot(), 'data');
const defaultDir = path.join(getAppRoot(), 'default');

// Ensure data and default directories exist
if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
}
if (!fs.existsSync(defaultDir)) {
  try { fs.mkdirSync(defaultDir, { recursive: true }); } catch (e) {}
}

app.get('/api/data/:collection', (req, res) => {
  const fileKey = req.params.collection;
  const dataPath = path.join(dataDir, `${fileKey}.json`);
  const defaultPath = path.join(defaultDir, `${fileKey}.json`);
  
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data) });
    }
    if (fs.existsSync(defaultPath)) {
      const data = fs.readFileSync(defaultPath, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data) });
    }
    return res.json({ success: true, data: null });
  } catch (err) {
    console.error(`[DroidOS] Error reading data file ${fileKey}.json`, err);
    res.status(500).json({ success: false, error: 'Read error' });
  }
});

app.post('/api/open-folder', (req, res) => {
  const { exec } = require('child_process');
  try {
    const folderPath = path.resolve(dataDir);
    if (process.platform === 'win32') {
      exec(`explorer.exe "${folderPath}"`, (err) => {
        if (err) console.error('[DroidOS] explorer error:', err);
      });
    } else if (process.platform === 'darwin') {
      exec(`open "${folderPath}"`, (err) => {
        if (err) console.error('[DroidOS] open error:', err);
      });
    } else {
      exec(`xdg-open "${folderPath}"`, (err) => {
        if (err) console.error('[DroidOS] xdg-open error:', err);
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[DroidOS] Failed to open folder:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/check-for-updates', (req, res) => {
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.checkForUpdatesAndNotify();
    res.json({ success: true, message: 'Check initiated' });
  } catch (err) {
    console.error('[DroidOS] Auto-updater error:', err);
    res.status(500).json({ success: false, error: 'Auto updater not available' });
  }
});

app.post('/api/data/:collection', (req, res) => {
  const fileKey = req.params.collection;
  const dataPath = path.join(dataDir, `${fileKey}.json`);
  
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    // Write pretty JSON to data directory
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error(`[DroidOS] Error writing data file ${fileKey}.json`, err);
    res.status(500).json({ success: false, error: 'Write error' });
  }
});

async function startServer() {
  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DroidOS] Workstation running on http://localhost:${PORT}`);
    console.log(`[DroidOS] OBS Overlay URL: http://localhost:${PORT}/overlay.html`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[DroidOS] Port ${PORT} already in use — another instance may be running. Skipping server start.`);
    } else {
      console.error('[DroidOS] Server error:', err);
    }
  });
}

startServer();
