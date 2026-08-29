import React, { useState } from 'react';
import {
  Tv,
  Layers,
  Radio,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Volume2,
  RefreshCw,
  Sliders,
  Settings,
  Shield,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Play,
  Palette,
  Eye,
  SlidersHorizontal,
  Flame,
  Zap,
  Gift,
  Trophy,
  Maximize2
} from 'lucide-react';
import { OBSConfig, ShoutoutConfig } from '../types';
import { soundSynth } from '../services/soundSynthesizer';
import { LiveOverlayPreviewStage, OverlayEventData } from './LiveOverlayPreviewStage';

interface OBSIntegrationTabProps {
  obsConfig: OBSConfig;
  onUpdateObsConfig: (config: OBSConfig) => void;
  shoutoutConfig: ShoutoutConfig;
  onUpdateShoutoutConfig: (config: ShoutoutConfig) => void;
  onTriggerAlert?: (type: string, title?: string, subtitle?: string) => void;
  onTriggerOverlayTest?: (type: string, data?: any) => void;
}

export const OBSIntegrationTab: React.FC<OBSIntegrationTabProps> = ({
  obsConfig,
  onUpdateObsConfig,
  shoutoutConfig,
  onUpdateShoutoutConfig,
  onTriggerAlert,
  onTriggerOverlayTest
}) => {
  const [config, setConfig] = useState<OBSConfig>(obsConfig || {
    connected: false,
    port: 4455,
    host: '127.0.0.1',
    password: '',
    currentScene: 'Gameplay Stream',
    scenes: ['Starting Soon', 'Just Chatting', 'Gameplay Stream', 'BRB Pause', 'Stream Ending'],
    autoSwitchOnRedeem: true
  });
  const [shoutout, setShoutout] = useState<ShoutoutConfig>(shoutoutConfig || {
    overlayTheme: 'neon-cyber',
    overlayPosition: 'bottom-left',
    overlayDurationSeconds: 6,
    showProfilePicture: true,
    animationType: 'slide',
    soundAlert: 'shoutout',
    chatMessageTemplate: 'Huge shoutout to @{username}! Check their channel at {channel_url}',
    autoShoutoutOnFirstMessage: true
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedAppGuide, setSelectedAppGuide] = useState<'obs' | 'streamlabs' | 'twitchstudio' | 'vmix' | 'xsplit'>('obs');
  const [activePreviewEvent, setActivePreviewEvent] = useState<OverlayEventData | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectToggle = () => {
    setIsConnecting(true);
    setTimeout(() => {
      const updated = { ...config, connected: !config.connected };
      setConfig(updated);
      onUpdateObsConfig(updated);
      setIsConnecting(false);
      if (updated.connected) {
        soundSynth.play('victory');
      }
    }, 600);
  };

  const handleSelectScene = (sceneName: string) => {
    const updated = { ...config, currentScene: sceneName };
    setConfig(updated);
    onUpdateObsConfig(updated);
  };

  const handleSaveShoutout = () => {
    onUpdateShoutoutConfig(shoutout);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const fireAlert = (type: string, title?: string, subtitle?: string) => {
    if (onTriggerAlert) onTriggerAlert(type, title, subtitle);
    if (onTriggerOverlayTest) onTriggerOverlayTest(type, { title, subtitle });

    // Also trigger in-app previewer
    setActivePreviewEvent({
      id: `so-${Date.now()}`,
      type: type as any,
      title: title || 'TEST ALERT',
      subtitle: subtitle || 'Broadcast signal previewed',
      username: title || 'PixelKnight',
      theme: shoutout.overlayTheme,
      timestamp: Date.now()
    });
  };

  const overlayUrl = 'http://localhost:3000/overlay.html';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Connect Your Streaming App Top Status Card */}
      <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all ${
            config.connected
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20'
              : 'bg-white/[0.04] border-white/10 text-slate-400'
          }`}>
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">Connect Your Streaming App</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                config.connected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {config.connected ? 'WebSocket v5.x Connected' : 'Browser Overlay Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect OBS Studio, Streamlabs Desktop, Twitch Studio, vMix, or XSplit to display live alerts, chat shoutouts, mass point drops, and minigame graphics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/overlay.html"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            <span>Open Browser Source</span>
          </a>

          <button
            onClick={handleConnectToggle}
            disabled={isConnecting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              config.connected
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 border border-cyan-400/30'
            }`}
          >
            {isConnecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : config.connected ? (
              <>
                <Shield className="w-3.5 h-3.5" /> Disconnect OBS
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" /> Connect WebSocket
              </>
            )}
          </button>
        </div>
      </div>

      {/* Streaming Platform Step-by-Step Connection Guide */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20 border border-white/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>How to Add Overlays to Your Streaming Software</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedAppGuide('obs')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAppGuide === 'obs' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
              }`}
            >
              OBS Studio
            </button>
            <button
              onClick={() => setSelectedAppGuide('streamlabs')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAppGuide === 'streamlabs' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
              }`}
            >
              Streamlabs Desktop
            </button>
            <button
              onClick={() => setSelectedAppGuide('twitchstudio')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAppGuide === 'twitchstudio' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
              }`}
            >
              Twitch Studio
            </button>
            <button
              onClick={() => setSelectedAppGuide('vmix')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAppGuide === 'vmix' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
              }`}
            >
              vMix / XSplit
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/10">
          {selectedAppGuide === 'obs' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>In <strong>OBS Studio</strong>, navigate to your active Scene and click the <strong>+ (Add Source)</strong> icon in the Sources dock.</li>
              <li>Select <strong>Browser</strong>, name it <code className="text-cyan-300">DroidOS Overlay</code>, and click OK.</li>
              <li>In the URL field, paste the <strong>Browser Source URL</strong> copied below (<code className="text-purple-300">http://localhost:3000/overlay.html</code>).</li>
              <li>Set <strong>Width</strong> to <code className="text-white">1920</code> and <strong>Height</strong> to <code className="text-white">1080</code>.</li>
              <li>Check <strong>"Shutdown source when not visible"</strong> and <strong>"Refresh browser when scene becomes active"</strong>.</li>
            </ol>
          )}
          {selectedAppGuide === 'streamlabs' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>In <strong>Streamlabs Desktop</strong>, click the <strong>+</strong> button under your Sources panel.</li>
              <li>Choose <strong>Browser Source</strong> from standard sources and click <strong>Add Source</strong>.</li>
              <li>Paste the URL below, set resolution to <code className="text-white">1920x1080</code>, and confirm.</li>
              <li>Position the overlay source on top of your game/camera layer.</li>
            </ol>
          )}
          {selectedAppGuide === 'twitchstudio' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>In <strong>Twitch Studio</strong>, edit your Layout and click <strong>+ (Add Layer)</strong>.</li>
              <li>Select <strong>Browser Source</strong> from the layer library.</li>
              <li>Paste the URL below into the Webpage URL field and resize to fill canvas.</li>
            </ol>
          )}
          {selectedAppGuide === 'vmix' && (
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>In <strong>vMix</strong> or <strong>XSplit Broadcaster</strong>, click <strong>Add Input &gt; Web Browser</strong>.</li>
              <li>Paste the Browser Source URL, set width 1920, height 1080, and assign as an Overlay channel.</li>
            </ol>
          )}
        </div>
      </div>

      {/* DIRECT IN-APP OVERLAY PREVIEW STAGE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-extrabold text-white">Live In-App Overlay Visual Stage Monitor</h2>
          </div>
          <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Realtime Direct Preview
          </span>
        </div>

        <LiveOverlayPreviewStage
          shoutoutConfig={shoutout}
          initialEvent={activePreviewEvent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Browser Source URL & Live OBS Scenes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Browser Source Setup Glass Box */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>OBS Browser Source URL</span>
              </div>
              <span className="text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                1920 x 1080 Transparent
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Add a new <strong className="text-slate-200">Browser Source</strong> in OBS Studio pointing to this local URL. It automatically plays achievement banners, chat shoutouts, sound effects, and confetti.
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 font-mono text-xs text-cyan-300">
              <span className="truncate">{overlayUrl}</span>
              <button
                onClick={() => copyToClipboard(overlayUrl, 'obs-src-url')}
                className="ml-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                {copiedKey === 'obs-src-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Recommended Width:</span>
                <span className="font-mono text-slate-200">1920 px</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recommended Height:</span>
                <span className="font-mono text-slate-200">1080 px</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shutdown source when not visible:</span>
                <span className="text-emerald-400 font-semibold">Unchecked (keep active)</span>
              </div>
            </div>
          </div>

          {/* OBS WebSocket Connection Config */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>WebSocket Credentials</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ws://localhost:4455</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">OBS WebSocket Host / IP</label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
                  placeholder="127.0.0.1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Server Port</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value, 10) || 4455 })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password (if set)</label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSwitchOnRedeem}
                    onChange={(e) => {
                      const updated = { ...config, autoSwitchOnRedeem: e.target.checked };
                      setConfig(updated);
                      onUpdateObsConfig(updated);
                    }}
                    className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Auto-switch scene on redeems</span>
                </label>
              </div>
            </div>
          </div>

          {/* Scene Switcher Studio */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Live OBS Scenes</span>
              </div>
              <span className="text-xs text-slate-400">Current: <strong className="text-emerald-300 font-mono">{config.currentScene}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {config.scenes.map((scene) => {
                const isActive = config.currentScene === scene;
                return (
                  <button
                    key={scene}
                    onClick={() => handleSelectScene(scene)}
                    className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-md shadow-emerald-950/40'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{scene}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Shoutout Customizer & Live Alert Tester */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Alert Trigger Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Overlay Test Emitter</span>
              </div>
              <span className="text-xs text-slate-400">Fire live alert to OBS & Direct In-App Preview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => fireAlert('achievement', 'Diamond Chatter', 'Sent 1,000 messages in stream chat')}
                className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Achievement</span>
              </button>

              <button
                onClick={() => fireAlert('shoutout', 'PixelKnight', 'Check out @PixelKnight on YouTube!')}
                className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Shoutout</span>
              </button>

              <button
                onClick={() => fireAlert('confetti')}
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Flame className="w-5 h-5 text-emerald-400" />
                <span>Confetti Burst</span>
              </button>

              <button
                onClick={() => fireAlert('redeem', 'Airhorn Blast', 'Redeemed by Luna_Starlight (300 coins)')}
                className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Gift className="w-5 h-5 text-amber-400" />
                <span>Redeem Sound</span>
              </button>
            </div>
          </div>

          {/* Shoutout & Alert Card Customizer */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Shoutout Banner & Toast Customizer</span>
              </div>

              <button
                onClick={handleSaveShoutout}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm border border-purple-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Saved!' : 'Save Style'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Visual Preset Theme</label>
                <select
                  value={shoutout.overlayTheme}
                  onChange={(e) => setShoutout({ ...shoutout, overlayTheme: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400/50"
                >
                  <option value="neon-cyber" className="bg-slate-900 text-white">Neon Cyberpunk</option>
                  <option value="retro-synth" className="bg-slate-900 text-white">Retro Synthwave</option>
                  <option value="clean-dark" className="bg-slate-900 text-white">Frosted Glass Minimal</option>
                  <option value="gold-royal" className="bg-slate-900 text-white">Royal Gold VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Screen Position</label>
                <select
                  value={shoutout.overlayPosition}
                  onChange={(e) => setShoutout({ ...shoutout, overlayPosition: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400/50"
                >
                  <option value="bottom-left" className="bg-slate-900 text-white">Bottom Left</option>
                  <option value="bottom-right" className="bg-slate-900 text-white">Bottom Right</option>
                  <option value="top-left" className="bg-slate-900 text-white">Top Left</option>
                  <option value="top-right" className="bg-slate-900 text-white">Top Right</option>
                  <option value="center" className="bg-slate-900 text-white">Screen Center</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Display Duration (Seconds)</label>
                <input
                  type="number"
                  value={shoutout.overlayDurationSeconds}
                  onChange={(e) => setShoutout({ ...shoutout, overlayDurationSeconds: parseInt(e.target.value, 10) || 6 })}
                  min="2"
                  max="30"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Entrance Animation</label>
                <select
                  value={shoutout.animationType}
                  onChange={(e) => setShoutout({ ...shoutout, animationType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400/50"
                >
                  <option value="slide" className="bg-slate-900 text-white">Slide & Spring</option>
                  <option value="pop" className="bg-slate-900 text-white">Pop & Scale</option>
                  <option value="glow" className="bg-slate-900 text-white">Glow Pulse</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Chat Shoutout Message Template</label>
                <input
                  type="text"
                  value={shoutout.chatMessageTemplate}
                  onChange={(e) => setShoutout({ ...shoutout, chatMessageTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400/50 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Variables: <code className="text-purple-300">@{'{username}'}</code>, <code className="text-cyan-300">{'{channel_url}'}</code>, <code className="text-amber-300">{'{custom_fact}'}</code></p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-white/[0.06] flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shoutout.autoShoutoutOnFirstMessage}
                    onChange={(e) => setShoutout({ ...shoutout, autoShoutoutOnFirstMessage: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Auto-shoutout on first chat message</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shoutout.showProfilePicture}
                    onChange={(e) => setShoutout({ ...shoutout, showProfilePicture: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Show avatar / channel badge</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
