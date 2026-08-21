import React from 'react';
import {
  Radio,
  Eye,
  Zap,
  Coins,
  Trophy,
  Volume2,
  Tv,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Flame,
  Users
} from 'lucide-react';
import { QueueManager } from './QueueManager';
import {
  BotIdentity,
  StreamLiveMetadata,
  PointsConfig,
  ChatMessage,
  ViewerProfile,
  ObsWebSocketConfig,
  AudioQueueItem
} from '../types';
import { playSynthesizedSound } from '../services/soundService';

interface DashboardTabProps {
  botIdentity: BotIdentity;
  streamMetadata: StreamLiveMetadata;
  pointsConfig: PointsConfig;
  messages: ChatMessage[];
  profiles: ViewerProfile[];
  obsConfig: ObsWebSocketConfig;
  uptimeSeconds: number;
  audioQueue: AudioQueueItem[];
  isProcessingQueue: boolean;
  aiEngineStatus: { status: 'online' | 'degraded' | 'offline', error?: string };
  onClearQueue: () => void;
  onRemoveQueueItem: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
  onTriggerQuickChat: (text: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  botIdentity,
  streamMetadata,
  pointsConfig,
  messages,
  profiles,
  obsConfig,
  audioQueue,
  isProcessingQueue,
  aiEngineStatus,
  onClearQueue,
  onRemoveQueueItem,
  onNavigateTab,
  onTriggerQuickChat
}) => {
  const totalPointsCirculating = profiles.reduce((acc, p) => acc + p.points, 0);
  const totalWatchTimeHours = Math.round(profiles.reduce((acc, p) => acc + p.watchTimeMinutes, 0) / 60);
  const recentMessages = messages.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Welcome Hero / Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              DROIDOS MISSION CONTROL
            </span>
            <span className="text-xs text-slate-400">Streamer: <strong className="text-white">{botIdentity.streamerName}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {streamMetadata.streamTitle}
          </h1>
          <p className="text-xs text-slate-400">
            Bot <span className="text-purple-300 font-semibold">{botIdentity.botName}</span> is actively monitoring chat & managing stream economy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('liveviewer')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Live Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Subscribers */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Subscribers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {streamMetadata.streamerAuth.authenticated ? streamMetadata.subscriberCount.toLocaleString() : 0}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{streamMetadata.streamerAuth.authenticated ? 'Live count' : 'Waiting for connection...'}</span>
          </div>
        </div>

        {/* Live Viewers */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Viewers</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {streamMetadata.streamerAuth.authenticated && streamMetadata.isLive ? streamMetadata.viewerCount : 0}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{streamMetadata.streamerAuth.authenticated ? '+18% viewer retention' : 'Waiting for connection...'}</span>
          </div>
        </div>

        {/* Points in Circulation */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{pointsConfig.currencyName} Pool</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {streamMetadata.streamerAuth.authenticated ? totalPointsCirculating.toLocaleString() : 0} {pointsConfig.currencySymbol}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {streamMetadata.streamerAuth.authenticated ? profiles.length : 0} viewer accounts
          </div>
        </div>

        {/* Community Watch Time */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Watch Time</span>
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">
            {streamMetadata.streamerAuth.authenticated ? totalWatchTimeHours : 0} hrs
          </div>
          <div className="text-[11px] text-purple-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{streamMetadata.streamerAuth.authenticated ? 'High community activity' : 'Waiting for connection...'}</span>
          </div>
        </div>

        {/* OBS WebSocket Status */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>OBS Studio Bridge</span>
            <Tv className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${obsConfig.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{obsConfig.connected ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Scene: <strong className="text-slate-300">{obsConfig.currentScene}</strong>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className={`bg-slate-900/90 border rounded-2xl p-4 shadow-lg space-y-2 ${
          aiEngineStatus.status === 'online' ? 'border-slate-800/90' : 'border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Brain Engine</span>
            <Sparkles className={`w-4 h-4 ${aiEngineStatus.status === 'online' ? 'text-blue-400' : 'text-amber-400'}`} />
          </div>
          <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              aiEngineStatus.status === 'online' ? 'bg-emerald-500' : 
              aiEngineStatus.status === 'degraded' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
            }`} />
            <span className="capitalize">{botIdentity.aiBrainMode === 'local' ? 'Local Mode' : aiEngineStatus.status}</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            {botIdentity.aiBrainMode === 'local' ? (
              <span className="text-blue-400 font-medium italic">Zero Credit Personality Engine Active</span>
            ) : aiEngineStatus.status === 'online' ? (
              <span className="text-emerald-400 font-medium">Gemini AI Active</span>
            ) : (
              <span className="text-amber-400">Fallback Engine: {aiEngineStatus.error || 'Local Only'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Soundboard + Live Chat Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Quick Stream Soundboard & Triggers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-xs font-bold text-white tracking-wide uppercase">Quick Stream Soundboard</h2>
              </div>
              <button
                onClick={() => onNavigateTab('soundeffects')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                All Sounds →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => playSynthesizedSound('airhorn', 0.8)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">📢</div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300">Hype Airhorn</div>
                <div className="text-[10px] text-slate-500">Synth Horn Burst</div>
              </button>

              <button
                onClick={() => playSynthesizedSound('fanfare', 0.7)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">🎺</div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300">Victory Fanfare</div>
                <div className="text-[10px] text-slate-500">Brass Chords</div>
              </button>

              <button
                onClick={() => playSynthesizedSound('level_up', 0.7)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">⭐</div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300">Level Up</div>
                <div className="text-[10px] text-slate-500">Ascending Chords</div>
              </button>

              <button
                onClick={() => playSynthesizedSound('coin', 0.6)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">🪙</div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300">Coin Ping</div>
                <div className="text-[10px] text-slate-500">Reward Sound</div>
              </button>

              <button
                onClick={() => playSynthesizedSound('zap', 0.6)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">⚡</div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300">Laser Zap</div>
                <div className="text-[10px] text-slate-500">Sci-Fi Blast</div>
              </button>

              <button
                onClick={() => playSynthesizedSound('applause', 0.6)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-base mb-1">👏</div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">Applause</div>
                <div className="text-[10px] text-slate-500">Crowd Cheering</div>
              </button>
            </div>
          </div>

          {/* Quick Chat Triggers */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Broadcaster Quick Broadcasts</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => onTriggerQuickChat('!ai what is today\'s stream game plan?')}
                className="px-3 py-1.5 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-800/60 hover:bg-blue-900/80 cursor-pointer"
              >
                🤖 Test AI Query
              </button>
              <button
                onClick={() => onTriggerQuickChat('!uptime')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                ⏱️ Check Uptime
              </button>
              <button
                onClick={() => onTriggerQuickChat('!rules')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                📜 Broadcast Rules
              </button>
              <button
                onClick={() => onTriggerQuickChat('!points')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                🪙 Check Points
              </button>
              <button
                onClick={() => onTriggerQuickChat('!discord')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                🎮 Post Discord Link
              </button>
            </div>
          </div>

          <QueueManager 
            queue={audioQueue}
            isProcessing={isProcessingQueue}
            onClearQueue={onClearQueue}
            onRemoveItem={onRemoveQueueItem}
          />
        </div>

        {/* Right 5 cols: Live Chat Highlights Feed */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Recent Chat Feed</h2>
            </div>
            <button
              onClick={() => onNavigateTab('liveviewer')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Full Screen Chat →
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[340px] scrollbar-thin">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No recent chat messages.
              </div>
            ) : (
              recentMessages.map((msg, idx) => (
                <div
                  key={msg.id ? `${msg.id}-${idx}` : `recent-msg-${idx}`}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                    msg.isBot
                      ? 'bg-purple-950/30 border-purple-800/40 text-purple-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="leading-snug">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
