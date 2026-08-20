import React, { useState } from 'react';
import {
  Megaphone,
  Tv,
  Volume2,
  Sparkles,
  Settings,
  Copy,
  Check,
  Play,
  RotateCcw,
  Video,
  User,
  Shield,
  Star,
  Clock,
  ExternalLink,
  Edit3,
  Search,
  Plus,
  HelpCircle
} from 'lucide-react';
import {
  ShoutoutConfig,
  ActiveShoutoutOverlay,
  ShoutoutHistoryItem,
  ViewerProfile
} from '../types';
import { ShoutoutOverlayWidget } from './ShoutoutOverlayWidget';

interface ShoutoutsTabProps {
  shoutoutConfig: ShoutoutConfig;
  setShoutoutConfig: React.Dispatch<React.SetStateAction<ShoutoutConfig>>;
  profiles: ViewerProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<ViewerProfile[]>>;
  shoutoutHistory: ShoutoutHistoryItem[];
  onTriggerShoutout: (profileOrUsername: ViewerProfile | string, customMsg?: string, triggerSource?: 'first_message' | 'command' | 'manual') => void;
  onPlaySound: (preset: string, volume?: number) => void;
  activeShoutout: ActiveShoutoutOverlay | null;
  onDismissOverlay: () => void;
}

export const ShoutoutsTab: React.FC<ShoutoutsTabProps> = ({
  shoutoutConfig,
  setShoutoutConfig,
  profiles,
  setProfiles,
  shoutoutHistory,
  onTriggerShoutout,
  onPlaySound,
  activeShoutout,
  onDismissOverlay
}) => {
  const [copiedObsUrl, setCopiedObsUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileForTest, setSelectedProfileForTest] = useState<string>(profiles[0]?.id || '');
  const [editingProfile, setEditingProfile] = useState<ViewerProfile | null>(null);

  // Edit form state
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editChannelUrl, setEditChannelUrl] = useState('');
  const [editCustomMsg, setEditCustomMsg] = useState('');
  const [editAutoSo, setEditAutoSo] = useState(true);

  const obsBrowserUrl = `${window.location.origin}/obs-overlay?type=shoutout`;

  const copyObsUrl = () => {
    navigator.clipboard.writeText(obsBrowserUrl);
    setCopiedObsUrl(true);
    setTimeout(() => setCopiedObsUrl(false), 2500);
  };

  const handleOpenEdit = (profile: ViewerProfile) => {
    setEditingProfile(profile);
    setEditAvatarUrl(profile.avatarUrl || '');
    setEditChannelUrl(profile.channelUrl || `https://youtube.com/@${profile.username}`);
    setEditCustomMsg(profile.customShoutoutMessage || '');
    setEditAutoSo(profile.autoShoutout !== false);
  };

  const handleSaveEdit = () => {
    if (!editingProfile) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === editingProfile.id
          ? {
              ...p,
              avatarUrl: editAvatarUrl.trim() || undefined,
              channelUrl: editChannelUrl.trim() || undefined,
              customShoutoutMessage: editCustomMsg.trim() || undefined,
              autoShoutout: editAutoSo
            }
          : p
      )
    );
    setEditingProfile(null);
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previewProfile = profiles.find((p) => p.id === selectedProfileForTest) || profiles[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Master Toggles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
              <Megaphone className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  First-Time Chatter Shoutouts & OBS Screen Overlays
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    shoutoutConfig.enabled
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {shoutoutConfig.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Automatically welcome viewers the moment they send their first message in chat.
                Displays their custom chat greeting and pops up their YouTube profile picture on your OBS broadcast screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-800 hover:border-cyan-500/50 px-4 py-2.5 rounded-xl transition-all">
              <input
                id="toggle-shoutouts-master"
                type="checkbox"
                checked={shoutoutConfig.enabled}
                onChange={(e) =>
                  setShoutoutConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-slate-200">Enable Shoutout System</span>
            </label>

            <button
              id="btn-quick-test-shoutout"
              onClick={() => {
                if (previewProfile) {
                  onTriggerShoutout(previewProfile, undefined, 'manual');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Test Shoutout on Screen
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Settings & Live OBS Overlay Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules & Chat Template Config (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Chat Message Automation Rules */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              First-Time Arrival Triggers & Chat Message
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  id="toggle-auto-first-message"
                  type="checkbox"
                  checked={shoutoutConfig.autoShoutoutOnFirstMessage}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      autoShoutoutOnFirstMessage: e.target.checked
                    }))
                  }
                  className="w-4 h-4 mt-0.5 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-cyan-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Auto-Trigger on Viewer's First Message
                  </div>
                  <div className="text-xs text-slate-400">
                    When a viewer sends their first chat message in the stream session, automatically post the shoutout and trigger the OBS screen popup.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  id="toggle-once-per-stream"
                  type="checkbox"
                  checked={shoutoutConfig.autoShoutoutOnlyOncePerStream}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      autoShoutoutOnlyOncePerStream: e.target.checked
                    }))
                  }
                  className="w-4 h-4 mt-0.5 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-cyan-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Limit to Once Per Stream Session
                  </div>
                  <div className="text-xs text-slate-400">
                    Prevents spam by ensuring each viewer is only shouted out once during the active broadcast.
                  </div>
                </div>
              </label>
            </div>

            {/* Chat Message Template */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Chat Message Template
                </label>
                <span className="text-xs text-slate-400">
                  Variables: <code className="text-cyan-400">{'{username}'}</code>,{' '}
                  <code className="text-cyan-400">{'{channel_url}'}</code>,{' '}
                  <code className="text-cyan-400">{'{role}'}</code>
                </span>
              </div>
              <textarea
                id="input-shoutout-chat-template"
                value={shoutoutConfig.chatMessageTemplate}
                onChange={(e) =>
                  setShoutoutConfig((prev) => ({
                    ...prev,
                    chatMessageTemplate: e.target.value
                  }))
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                placeholder="📣 Huge shoutout to @{username}! Check out their channel: {channel_url}"
              />
            </div>

            {/* Audio Alert Preset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Sound Effect SFX
                </label>
                <select
                  id="select-shoutout-sound"
                  value={shoutoutConfig.soundEffectPreset}
                  onChange={(e) => {
                    const preset = e.target.value as any;
                    setShoutoutConfig((prev) => ({ ...prev, soundEffectPreset: preset }));
                    if (preset !== 'none') {
                      onPlaySound(preset, shoutoutConfig.soundVolume);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="fanfare">🎺 Triumphant Fanfare</option>
                  <option value="applause">👏 Crowd Applause</option>
                  <option value="level_up">✨ Level Up Chords</option>
                  <option value="coin">🪙 Arcade Coin</option>
                  <option value="bell">🔔 Crystal Bell</option>
                  <option value="airhorn">📢 Hype Airhorn</option>
                  <option value="none">🔇 Muted (No Sound)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Volume ({Math.round(shoutoutConfig.soundVolume * 100)}%)
                  </label>
                  <button
                    onClick={() => onPlaySound(shoutoutConfig.soundEffectPreset, shoutoutConfig.soundVolume)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Test Audio
                  </button>
                </div>
                <input
                  id="range-shoutout-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={shoutoutConfig.soundVolume}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      soundVolume: parseFloat(e.target.value)
                    }))
                  }
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* OBS Studio Screen Overlay Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                OBS Screen Overlay Customizer
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="toggle-obs-overlay-enabled"
                  type="checkbox"
                  checked={shoutoutConfig.obsOverlayEnabled}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({ ...prev, obsOverlayEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300 font-medium">Show On-Screen Overlay</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Theme Style */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Overlay Theme
                </label>
                <select
                  id="select-shoutout-theme"
                  value={shoutoutConfig.overlayTheme}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      overlayTheme: e.target.value as any
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="neon-cyber">⚡ Cyberpunk Neon Glow</option>
                  <option value="glass-modern">🍃 Frosted Glass Emerald</option>
                  <option value="gold-vip">⭐ Luxury Gold VIP</option>
                  <option value="gradient-stream">🌌 Stream Purple Gradient</option>
                  <option value="minimal-card">🔲 Minimalist Modern Dark</option>
                </select>
              </div>

              {/* Screen Position */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Screen Placement
                </label>
                <select
                  id="select-shoutout-position"
                  value={shoutoutConfig.overlayPosition}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      overlayPosition: e.target.value as any
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="bottom-left">Bottom Left (Recommended)</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Screen Center Banner</option>
                </select>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Display Duration: {shoutoutConfig.overlayDurationSeconds} Seconds
                </label>
                <input
                  id="range-overlay-duration"
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={shoutoutConfig.overlayDurationSeconds}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      overlayDurationSeconds: parseInt(e.target.value, 10)
                    }))
                  }
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Heading Text */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Banner Title
                </label>
                <input
                  id="input-overlay-heading"
                  type="text"
                  value={shoutoutConfig.overlayHeading}
                  onChange={(e) =>
                    setShoutoutConfig((prev) => ({
                      ...prev,
                      overlayHeading: e.target.value
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                  placeholder="COMMUNITY SHOUTOUT"
                />
              </div>
            </div>

            {/* OBS Studio Browser Source Link */}
            <div className="p-4 bg-slate-950 border border-cyan-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" />
                  OBS Studio Browser Source URL
                </span>
                <button
                  id="btn-copy-obs-url"
                  onClick={copyObsUrl}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copiedObsUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy OBS URL</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                In OBS Studio, add a <strong className="text-slate-200">Browser Source</strong> (Width: 600, Height: 240) and paste this URL or use in-app overlay rendering.
              </p>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-400/90 truncate select-all">
                {obsBrowserUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Overlay Widget Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                Live Overlay Preview
              </h2>
              <span className="text-xs text-slate-400">Interactive Sample</span>
            </div>

            {/* Select Viewer to Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Preview with Viewer Profile:
              </label>
              <select
                id="select-preview-viewer"
                value={selectedProfileForTest}
                onChange={(e) => setSelectedProfileForTest(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    @{p.username} ({p.role.toUpperCase()}) {p.avatarUrl ? '🖼️ [Avatar Set]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Live OBS Overlay Widget Component */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-center min-h-[190px]">
              {previewProfile && (
                <ShoutoutOverlayWidget
                  activeShoutout={{
                    id: 'preview-widget',
                    username: previewProfile.username,
                    displayName: previewProfile.displayName,
                    role: previewProfile.role,
                    avatarUrl: previewProfile.avatarUrl,
                    avatarColor: previewProfile.avatarColor,
                    channelUrl: previewProfile.channelUrl || `https://youtube.com/@${previewProfile.username}`,
                    heading: shoutoutConfig.overlayHeading || '🌟 COMMUNITY SHOUTOUT',
                    subheading: shoutoutConfig.overlaySubheadingTemplate.replace('{username}', previewProfile.username),
                    customMessage: previewProfile.customShoutoutMessage || 'Welcome to the broadcast! Glad to have you here in chat.',
                    timestamp: 'Just now',
                    durationMs: shoutoutConfig.overlayDurationSeconds * 1000,
                    theme: shoutoutConfig.overlayTheme,
                    position: 'bottom-left',
                    animation: shoutoutConfig.animationType
                  }}
                  onDismiss={() => {}}
                  isObsSourcePreview={true}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                id="btn-test-trigger-current-preview"
                onClick={() => {
                  if (previewProfile) {
                    onTriggerShoutout(previewProfile, undefined, 'manual');
                  }
                }}
                className="w-full py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-300" />
                Trigger Live Alert & Chat Message
              </button>
            </div>
          </div>

          {/* Quick Chat Command Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              Stream Chat Commands
            </h3>
            <p className="text-xs text-slate-400">
              Broadcasters and moderators can also manually trigger a shoutout on screen anytime by typing:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-cyan-400 font-bold">!so @username</span>
                <span className="text-slate-400 text-[11px]">Triggers OBS popup & YouTube link</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-cyan-400 font-bold">!shoutout @username</span>
                <span className="text-slate-400 text-[11px]">Full command alias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer YouTube Profiles & Custom Shoutouts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-red-500" />
              Viewer YouTube Profile Pictures & Custom Shoutouts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize YouTube avatar links, channel URLs, and custom messages for each community member.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search viewers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* Profiles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Viewer / YouTube Avatar</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">YouTube Channel Link</th>
                <th className="py-3 px-4">Custom Shoutout Note</th>
                <th className="py-3 px-4 text-center">Auto-Shoutout</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Avatar & Username */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.username}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/40"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${
                            p.avatarColor || 'from-cyan-500 to-blue-600'
                          }`}
                        >
                          {p.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">@{p.username}</div>
                        <div className="text-[11px] text-slate-400">{p.displayName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {p.role}
                    </span>
                  </td>

                  {/* Channel URL */}
                  <td className="py-3.5 px-4 max-w-xs truncate">
                    {p.channelUrl ? (
                      <a
                        href={p.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Video className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{p.channelUrl}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">
                        https://youtube.com/@{p.username}
                      </span>
                    )}
                  </td>

                  {/* Custom Message */}
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-300 text-[11px]">
                    {p.customShoutoutMessage || (
                      <span className="text-slate-400 italic">Default message</span>
                    )}
                  </td>

                  {/* Auto Shoutout Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.autoShoutout !== false
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {p.autoShoutout !== false ? 'ON' : 'OFF'}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Edit YouTube Avatar & Shoutout Message"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onTriggerShoutout(p, undefined, 'manual')}
                        className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                        title="Trigger Shoutout Now"
                      >
                        <Megaphone className="w-3 h-3" />
                        Shoutout
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatched Shoutouts Session History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Live Session Shoutout Log
          </h2>
          <span className="text-xs text-slate-400">
            {shoutoutHistory.length} Dispatched During Stream
          </span>
        </div>

        {shoutoutHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
            No shoutouts have been dispatched in this stream session yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {shoutoutHistory.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.username}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                      {item.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">@{item.username}</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {item.triggeredBy === 'first_message' ? 'First Chat' : item.triggeredBy}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate font-mono mt-0.5">
                      {item.chatMessage}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onTriggerShoutout(item.username, undefined, 'manual')}
                  className="px-2.5 py-1 text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 transition-colors shrink-0"
                >
                  Shoutout Again
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Viewer Shoutout Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Customize Shoutout: @{editingProfile.username}
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Avatar Preview & URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  YouTube Avatar / Profile Picture URL
                </label>
                <div className="flex items-center gap-3">
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <input
                    type="url"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* YouTube Channel URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  YouTube Channel Link
                </label>
                <input
                  type="url"
                  value={editChannelUrl}
                  onChange={(e) => setEditChannelUrl(e.target.value)}
                  placeholder={`https://youtube.com/@${editingProfile.username}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none font-mono"
                />
              </div>

              {/* Custom Shoutout Message Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Custom Shoutout Message (Optional Override)
                </label>
                <textarea
                  value={editCustomMsg}
                  onChange={(e) => setEditCustomMsg(e.target.value)}
                  rows={2}
                  placeholder="Leave empty to use global default template"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Auto Shoutout Checkbox */}
              <label className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editAutoSo}
                  onChange={(e) => setEditAutoSo(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-200 font-medium">
                  Trigger automatic shoutout when this viewer sends first message
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-cyan-500/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
