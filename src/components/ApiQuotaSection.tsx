import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Radio,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sliders,
  Send,
  MessageSquare,
  Sparkles,
  Link,
  Shield,
  Layers,
  Flame,
  Info,
  ExternalLink,
  Bot,
  UserCheck
} from 'lucide-react';
import {
  ApiQuotaUsage,
  StreamConnectionType,
  ConnectionStatus,
  AppSettings,
  StreamMetadata
} from '../types';
import {
  getQuotaMetrics,
  subscribeToQuotaUpdates,
  resetQuotaMetrics,
  setDailyQuotaLimit,
  recordApiCall,
  updateConnectionState
} from '../services/apiQuotaTracker';
import { soundSynth } from '../services/soundSynthesizer';

interface ApiQuotaSectionProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  streamMetadata: StreamMetadata;
  onUpdateStreamMetadata: (meta: StreamMetadata) => void;
  isCompact?: boolean;
}

export const ApiQuotaSection: React.FC<ApiQuotaSectionProps> = ({
  settings,
  onUpdateSettings,
  streamMetadata,
  onUpdateStreamMetadata,
  isCompact = false
}) => {
  const [metrics, setMetrics] = useState<ApiQuotaUsage>(getQuotaMetrics());
  const [selectedStreamType, setSelectedStreamType] = useState<StreamConnectionType>(
    settings.targetStreamType || 'live'
  );
  const [targetInput, setTargetInput] = useState(settings.targetStreamIdOrUrl || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [customLimitInput, setCustomLimitInput] = useState(String(metrics.dailyLimit || 10000));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testActionNotice, setTestActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToQuotaUpdates((updated) => {
      setMetrics(updated);
    });
    return unsubscribe;
  }, []);

  const percentUsed = Math.min(100, Math.round((metrics.unitsUsedToday / metrics.dailyLimit) * 100));
  const remainingUnits = Math.max(0, metrics.dailyLimit - metrics.unitsUsedToday);

  const getStatusBadge = () => {
    if (metrics.status === 'exhausted') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5 animate-pulse">
          <XCircle className="w-3.5 h-3.5" />
          QUOTA EXHAUSTED (LIMIT REACHED)
        </span>
      );
    }
    if (metrics.status === 'warning' || percentUsed >= 80) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          QUOTA WARNING ({percentUsed}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        QUOTA HEALTHY ({100 - percentUsed}% REMAINING)
      </span>
    );
  };

  const getConnectionBadge = () => {
    switch (metrics.connectionStatus) {
      case 'connected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            PERSISTENTLY CONNECTED
          </span>
        );
      case 'connecting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            CONNECTING...
          </span>
        );
      case 'reconnecting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            AUTO-RECONNECTING
          </span>
        );
      case 'quota_exhausted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-red-400" />
            PAUSED (QUOTA LIMIT)
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            DISCONNECTED
          </span>
        );
    }
  };

  const handleToggleConnection = () => {
    soundSynth.play('coin');
    if (metrics.connectionStatus === 'connected') {
      updateConnectionState('disconnected');
    } else {
      setIsConnecting(true);
      updateConnectionState('connecting', { streamType: selectedStreamType });
      setTimeout(() => {
        setIsConnecting(false);
        updateConnectionState('connected', {
          streamType: selectedStreamType,
          streamTitle: targetInput ? `Stream (${targetInput.slice(0, 16)}...)` : `${selectedStreamType.toUpperCase()} Stream`,
          pollingIntervalSeconds: 4
        });
      }, 800);
    }
  };

  const handleSimulatePoll = () => {
    const res = recordApiCall('list_chat');
    soundSynth.play('laser');
    setTestActionNotice(`Recorded 1 liveChatMessages.list call (+1 unit). Remaining: ${res.remainingUnits.toLocaleString()}`);
    setTimeout(() => setTestActionNotice(null), 3000);
  };

  const handleSimulateMessage = () => {
    const res = recordApiCall('send_message');
    soundSynth.play('airhorn');
    setTestActionNotice(`Recorded 1 liveChatMessages.insert call (+50 units). Remaining: ${res.remainingUnits.toLocaleString()}`);
    setTimeout(() => setTestActionNotice(null), 3000);
  };

  const handleResetQuota = () => {
    resetQuotaMetrics();
    soundSynth.play('level_up');
    setTestActionNotice('Daily API quota usage reset to 0 units.');
    setTimeout(() => setTestActionNotice(null), 3000);
  };

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseInt(customLimitInput, 10);
    if (!isNaN(limit) && limit > 0) {
      setDailyQuotaLimit(limit);
      onUpdateSettings({ ...settings, apiDailyQuotaLimit: limit });
      soundSynth.play('coin');
      setTestActionNotice(`Daily limit updated to ${limit.toLocaleString()} units.`);
      setTimeout(() => setTestActionNotice(null), 3000);
    }
  };

  // Compact Mode (used in Live Chat Monitor banner / dashboard widget)
  if (isCompact) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 border border-white/10 shadow-lg space-y-3 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-white">YouTube API Quota Meter</span>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2">
            {getConnectionBadge()}
          </div>
        </div>

        {/* Meter bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">
              Used: <strong className="text-white">{metrics.unitsUsedToday.toLocaleString()}</strong> / {metrics.dailyLimit.toLocaleString()} units ({percentUsed}%)
            </span>
            <span className="text-purple-300 font-semibold">
              {metrics.estimatedHoursRemaining} hrs polling left @ 4s interval
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentUsed >= 95
                  ? 'bg-red-500'
                  : percentUsed >= 80
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {metrics.status === 'exhausted' && (
          <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Quota Exhausted:</strong> The bot has paused sending messages because your YouTube Data API 10,000 units limit has been reached. It will resume when quota resets at midnight PST.
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Real-time Quota Health */}
      <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-extrabold text-white">YouTube Data API v3 Quota & Usage Monitor</h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time API quota telemetry, polling rate health, and persistent live stream connection management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {getConnectionBadge()}
            <button
              onClick={handleToggleConnection}
              disabled={isConnecting}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                metrics.connectionStatus === 'connected'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {metrics.connectionStatus === 'connected' ? 'Disconnect Chat' : 'Connect Persistent Listener'}
            </button>
          </div>
        </div>

        {/* Quota Exhaustion Warning Alert (if limit exceeded) */}
        {metrics.status === 'exhausted' && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 shadow-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>YouTube API Daily Quota Limit Reached (10,000 / 10,000 Units)</span>
            </div>
            <p className="text-red-200/90 leading-relaxed pl-7">
              If the bot is not responding to chat messages, it is because your Google Cloud YouTube Data API daily budget has been fully consumed today. Polling and automated replies have been safely paused to prevent account penalties. Quotas reset automatically at midnight Pacific Time (PST). You can also click <strong>"Calibrate / Reset Counter"</strong> below for testing.
            </p>
          </div>
        )}

        {/* Progress Bar & Key Numbers */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Daily Quota Consumed:</span>
              <span className="font-extrabold text-white text-sm font-mono">
                {metrics.unitsUsedToday.toLocaleString()} / {metrics.dailyLimit.toLocaleString()} units
              </span>
              <span className="text-xs text-purple-300 font-semibold bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30 font-mono">
                {percentUsed}% Used
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>
                Remaining: <strong className="text-emerald-300 font-mono">{remainingUnits.toLocaleString()} units</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-300 font-semibold font-mono">
                <Clock className="w-3.5 h-3.5" />
                ~{metrics.estimatedHoursRemaining} hrs of continuous live polling left
              </span>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden border border-white/10 p-0.5">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                percentUsed >= 95
                  ? 'bg-red-500 shadow-sm shadow-red-500/50'
                  : percentUsed >= 80
                  ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                  : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Usage Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Live Chat Polls</span>
              <span className="text-[10px] text-purple-300 bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/20 font-mono">
                1 unit/poll
              </span>
            </div>
            <div className="text-lg font-extrabold text-white font-mono">
              {metrics.liveChatPollsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              ={metrics.liveChatPollsCount.toLocaleString()} units total
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Bot Messages Sent</span>
              <span className="text-[10px] text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono">
                50 units/msg
              </span>
            </div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">
              {metrics.messagesSentCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              ={(metrics.messagesSentCount * 50).toLocaleString()} units total
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Broadcast Checks</span>
              <span className="text-[10px] text-cyan-300 bg-cyan-500/15 px-1.5 py-0.2 rounded border border-cyan-500/20 font-mono">
                1 unit/call
              </span>
            </div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono">
              {metrics.broadcastLookupsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              ={metrics.broadcastLookupsCount.toLocaleString()} units total
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Adaptive Polling Rate</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                Friendly
              </span>
            </div>
            <div className="text-lg font-extrabold text-emerald-300 font-mono">
              {metrics.pollingIntervalSeconds}s
            </div>
            <div className="text-[10px] text-slate-500">
              ~{Math.round(3600 / metrics.pollingIntervalSeconds)} units/hour
            </div>
          </div>
        </div>

        {testActionNotice && (
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2 animate-fadeIn font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            {testActionNotice}
          </div>
        )}
      </div>

      {/* Stream Target Connection Selector (Live, Scheduled/Upcoming, Unlisted/Private) */}
      <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
        <div className="border-b border-white/[0.08] pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            Stream Connection Target & Multi-Type Support
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            DroidOS can connect persistently to Live broadcasts, Upcoming/Scheduled streams (chat waiting room), and Unlisted/Private streams.
          </p>
        </div>

        {/* Stream Type Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedStreamType('live');
              onUpdateSettings({ ...settings, targetStreamType: 'live' });
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
              selectedStreamType === 'live'
                ? 'bg-red-500/20 border-red-500/50 text-white shadow-md'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Broadcast
              </span>
              {selectedStreamType === 'live' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Currently active on-air public stream
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStreamType('upcoming');
              onUpdateSettings({ ...settings, targetStreamType: 'upcoming' });
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
              selectedStreamType === 'upcoming'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-md'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Scheduled / Upcoming
              </span>
              {selectedStreamType === 'upcoming' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Pre-stream waiting room & countdown chat
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStreamType('unlisted_private');
              onUpdateSettings({ ...settings, targetStreamType: 'unlisted_private' });
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
              selectedStreamType === 'unlisted_private'
                ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-md'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Unlisted / Private Stream
              </span>
              {selectedStreamType === 'unlisted_private' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Private test streams or unlisted sponsor events
            </span>
          </button>
        </div>

        {/* Target URL or ID Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-slate-400" />
            Specific Stream URL or Video ID (Optional / Auto-detected from Host Channel)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetInput}
              onChange={(e) => {
                setTargetInput(e.target.value);
                onUpdateSettings({ ...settings, targetStreamIdOrUrl: e.target.value });
              }}
              placeholder="e.g. https://youtube.com/watch?v=dQw4w9WgXcQ or live-broadcast-id"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 font-mono"
            />
            <button
              type="button"
              onClick={handleToggleConnection}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
            >
              {metrics.connectionStatus === 'connected' ? 'Update & Reconnect' : 'Connect Target'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Leave blank to automatically connect to whatever stream is currently active on <strong>{settings.channelHandle || '@MRADDICTIVE'}</strong>.
          </p>
        </div>
      </div>

      {/* Auto-Welcome Viewers & Memory Responses Control Section */}
      <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Automated Welcome System (New vs. Returning Viewers)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically welcome chatters when they send their first message. New viewers receive greetings; returning viewers receive memory responses.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoWelcomeViewers ?? true}
              onChange={(e) => {
                onUpdateSettings({ ...settings, autoWelcomeViewers: e.target.checked });
                soundSynth.play('coin');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Bot className="w-4 h-4 text-purple-400" />
              Brand New Viewers (First Visit)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a chatter enters the stream for the first time, the bot greets them with warm welcome lines from the active personality bank (20+ greeting variations).
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg font-mono border border-white/5">
              Example: "Welcome, @{'{username}'}! Take a breath and settle in."
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Returning Viewers (With Memory Facts)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an existing viewer chats, the bot identifies their profile and dynamically weaves in their logged memory facts, visit streak, or custom facts!
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg font-mono border border-white/5">
              Example: "Welcome back @{'{username}'}! (Still remember when you {'{custom_fact}'}!)"
            </div>
          </div>
        </div>

        {/* Welcome Mode Selector */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-300">Welcome Strategy Filter</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, autoWelcomeMode: 'all' })}
              className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                (settings.autoWelcomeMode || 'all') === 'all'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                  : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              🌟 All Viewers (Smart Routing)
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, autoWelcomeMode: 'new_only' })}
              className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                settings.autoWelcomeMode === 'new_only'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                  : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              👋 New Viewers Only
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, autoWelcomeMode: 'returning_memory' })}
              className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                settings.autoWelcomeMode === 'returning_memory'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                  : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              🧠 Returning & Memory Viewers Only
            </button>
          </div>
        </div>
      </div>

      {/* Quota Diagnostics & Calibration Tools */}
      <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Quota Calibration & Testing Tools
            </h3>
            <p className="text-xs text-slate-400">
              Calibrate usage counters, simulate test calls, or adjust your Google Cloud project quota budget
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleSimulatePoll}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Simulate 1 Poll (+1 Unit)
          </button>

          <button
            type="button"
            onClick={handleSimulateMessage}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-xs font-semibold text-amber-300 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            Simulate 1 Message (+50 Units)
          </button>

          <button
            type="button"
            onClick={handleResetQuota}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-xs font-semibold text-emerald-300 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Calibrate / Reset Usage (0)
          </button>
        </div>

        {/* Custom Daily Limit Adjuster Form */}
        <form onSubmit={handleUpdateLimit} className="flex items-center gap-3 pt-2">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-slate-400">
              Custom Daily Quota Budget (Default: 10,000 units)
            </label>
            <input
              type="number"
              value={customLimitInput}
              onChange={(e) => setCustomLimitInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/60"
            />
          </div>
          <button
            type="submit"
            className="self-end px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all border border-white/10"
          >
            Save Limit
          </button>
        </form>
      </div>
    </div>
  );
};
