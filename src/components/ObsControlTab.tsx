import React, { useState, useEffect } from 'react';
import { Tv, RefreshCw, Zap, Sparkles, Image, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ObsWebSocketConfig } from '../types';
import { playSynthesizedSound } from '../services/soundService';
import { obsService } from '../services/obsService';

interface ObsControlTabProps {
  obsConfig: ObsWebSocketConfig;
  setObsConfig: React.Dispatch<React.SetStateAction<ObsWebSocketConfig>>;
  onSaveNotice: () => void;
  onSendLog: (level: 'info' | 'warn' | 'success' | 'bot', module: 'OBS', msg: string) => void;
}

export const ObsControlTab: React.FC<ObsControlTabProps> = ({
  obsConfig,
  setObsConfig,
  onSaveNotice,
  onSendLog
}) => {
  const [host, setHost] = useState(obsConfig.host || 'localhost');
  const [port, setPort] = useState(obsConfig.port || 4455);
  const [password, setPassword] = useState(obsConfig.password || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeOverlayGif, setActiveOverlayGif] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Sync external obsConfig updates into local inputs if changed
  useEffect(() => {
    if (obsConfig.host) setHost(obsConfig.host);
    if (obsConfig.port) setPort(obsConfig.port);
    if (obsConfig.password !== undefined) setPassword(obsConfig.password);
  }, [obsConfig.host, obsConfig.port, obsConfig.password]);

  // Subscribe to real-time obsService status
  useEffect(() => {
    const unsubStatus = obsService.subscribeStatus((connected, currentScene, scenes) => {
      setObsConfig(prev => ({
        ...prev,
        connected,
        currentScene: currentScene || prev.currentScene,
        scenes: scenes.length > 0 ? scenes : prev.scenes
      }));
    });

    const unsubLogs = obsService.subscribeLogs((level, msg) => {
      onSendLog(level, 'OBS', msg);
    });

    return () => {
      unsubStatus();
      unsubLogs();
    };
  }, [setObsConfig, onSendLog]);

  const handleToggleConnect = async () => {
    setConnectionError(null);
    setIsConnecting(true);

    const updatedConfig: ObsWebSocketConfig = {
      ...obsConfig,
      host,
      port: Number(port) || 4455,
      password
    };
    setObsConfig(updatedConfig);
    onSaveNotice();

    if (obsConfig.connected) {
      await obsService.disconnect();
      setIsConnecting(false);
      onSendLog('warn', 'OBS', 'Disconnected from OBS Studio WebSocket.');
    } else {
      const result = await obsService.connect(host, Number(port) || 4455, password);
      setIsConnecting(false);
      if (!result.success) {
        setConnectionError(result.error || 'Failed to connect. Check OBS WebSocket settings.');
      } else {
        setConnectionError(null);
      }
    }
  };

  const handleSwitchScene = async (scene: string) => {
    if (obsConfig.connected) {
      await obsService.setScene(scene);
    } else {
      setObsConfig((prev) => ({ ...prev, currentScene: scene }));
      onSendLog('info', 'OBS', `(Simulation) Switched OBS scene to "${scene}"`);
    }
    onSaveNotice();
  };

  const handleTriggerGifOverlay = (url: string, durationMs: number = 6000) => {
    setActiveOverlayGif(url);
    playSynthesizedSound('fanfare', 0.6);
    onSendLog('success', 'OBS', `Triggered on-screen GIF overlay for ${durationMs / 1000}s`);
    setTimeout(() => {
      setActiveOverlayGif(null);
    }, durationMs);
  };

  const handleSaveCredentials = () => {
    setObsConfig(prev => ({
      ...prev,
      host,
      port: Number(port) || 4455,
      password
    }));
    onSaveNotice();
    onSendLog('info', 'OBS', 'Saved OBS credentials to cloud & local workspace.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">OBS Studio WebSocket Bridge</h2>
            <p className="text-xs text-slate-400">
              Directly control OBS Studio scenes, sound effects, and overlays via WebSocket v5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                obsConfig.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-200 font-semibold">
              {obsConfig.connected ? 'OBS Live Connected' : 'Disconnected'}
            </span>
          </div>

          <button
            onClick={handleToggleConnect}
            disabled={isConnecting}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              obsConfig.connected
                ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{obsConfig.connected ? 'Disconnect OBS' : (isConnecting ? 'Connecting...' : 'Connect to OBS')}</span>
          </button>
        </div>
      </div>

      {connectionError && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 text-xs text-rose-300 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div>
            <strong className="block font-semibold">OBS Connection Error:</strong>
            <span>{connectionError}</span>
            <p className="text-[11px] text-rose-400/80 mt-1">
              Ensure OBS is open, <strong>Tools → WebSocket Server Settings</strong> is enabled, Server Port matches ({port}), and if a password is set, it matches. Note: If accessing from an external browser, check firewall/LAN access.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: WebSocket Config & Scene Switcher (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Connection Settings */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>OBS WebSocket Server Credentials</span>
              </h3>
              <button
                onClick={handleSaveCredentials}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Credentials</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Server Host / IP</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  onBlur={handleSaveCredentials}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  placeholder="localhost or 192.168.1.X"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Port</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  onBlur={handleSaveCredentials}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  placeholder="4455"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">WebSocket Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleSaveCredentials}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                placeholder="•••••••• (leave empty if none)"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Configured inside OBS Studio: <em>Tools → WebSocket Server Settings (Default Port 4455)</em>.
              </p>
            </div>
          </div>

          {/* Scene Switcher */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Live Scene Switcher</span>
              </span>
              <span className="text-slate-400">Current: <strong className="text-emerald-400">{obsConfig.currentScene || 'None'}</strong></span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {obsConfig.scenes.map((scene) => (
                <button
                  key={scene}
                  onClick={() => handleSwitchScene(scene)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    obsConfig.currentScene === scene
                      ? 'bg-rose-950/40 border-rose-500/50 text-white shadow-md shadow-rose-950/50'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-semibold">{scene}</span>
                  {obsConfig.currentScene === scene && (
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                      LIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Stream Overlay Preview & Test Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                OBS Overlay Preview Canvas
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              1920x1080
            </span>
          </div>

          {/* Visual Monitor Canvas */}
          <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 opacity-80" />

            {activeOverlayGif ? (
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <img
                  src={activeOverlayGif}
                  alt="Overlay GIF"
                  className="max-h-40 max-w-full rounded-lg shadow-2xl border border-purple-500/40"
                />
                <span className="mt-2 px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs shadow-lg">
                  🎉 Redemptions Alert!
                </span>
              </div>
            ) : (
              <div className="relative z-10 text-center space-y-2 p-4">
                <Tv className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  {obsConfig.connected
                    ? `OBS Connected: [${obsConfig.currentScene}]`
                    : 'OBS Canvas Standing By'}
                </p>
                <span className="inline-block text-[10px] text-slate-600 bg-slate-900 px-2 py-1 rounded-md">
                  GIFs & Sounds triggered by viewers render here
                </span>
              </div>
            )}
          </div>

          {/* Quick Overlay Triggers */}
          <div className="space-y-2 text-xs pt-1">
            <span className="font-semibold text-slate-300 block">Test On-Screen Overlay Alerts:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  handleTriggerGifOverlay('https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif')
                }
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Image className="w-4 h-4 text-purple-400" />
                <span>🐱 Dancing Cat</span>
              </button>
              <button
                onClick={() =>
                  handleTriggerGifOverlay('https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif')
                }
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>⭐ Gold Star Hype</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

