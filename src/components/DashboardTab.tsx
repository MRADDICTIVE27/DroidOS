import React, { useState } from 'react';
import {
  Radio,
  Tv,
  Users,
  Award,
  Coins,
  Bot,
  Volume2,
  Send,
  Zap,
  Flame,
  Sparkles,
  Layers,
  Shield,
  MessageSquare,
  Gift,
  Dice5,
  Swords,
  Megaphone,
  CheckCircle2,
  Play
} from 'lucide-react';
import {
  BotPersonality,
  ChatMessage,
  StreamMetadata,
  OBSConfig,
  EconomySettings,
  ViewerProfile
} from '../types';
import { soundSynth } from '../services/soundSynthesizer';

interface DashboardTabProps {
  streamMetadata: StreamMetadata;
  activePersonality: BotPersonality;
  personalities: BotPersonality[];
  onSelectPersonality: (personality: BotPersonality) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  obsConfig: OBSConfig;
  onSwitchScene: (sceneName: string) => void;
  economy: EconomySettings;
  viewers: ViewerProfile[];
  onTriggerOverlayAlert: (alertType: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  streamMetadata,
  activePersonality,
  personalities,
  onSelectPersonality,
  chatMessages,
  onSendMessage,
  obsConfig,
  onSwitchScene,
  economy,
  viewers,
  onTriggerOverlayAlert,
  onNavigateTab
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSendMessage(quickInput);
    setQuickInput('');
  };

  const soundPads = [
    { label: 'Airhorn', preset: 'airhorn', icon: '📢', color: 'from-amber-500/20 to-red-500/20 text-amber-300 border-amber-500/30' },
    { label: 'Coin Clink', preset: 'coin', icon: '🪙', color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30' },
    { label: 'Level Up', preset: 'level_up', icon: '⭐', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
    { label: 'Jackpot', preset: 'jackpot', icon: '💎', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30' },
    { label: 'Victory', preset: 'victory', icon: '🏆', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30' },
    { label: 'Laser Blast', preset: 'laser', icon: '⚡', color: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30' },
    { label: 'Bank Alarm', preset: 'alarm', icon: '🚨', color: 'from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30' },
    { label: 'Chime', preset: 'shoutout', icon: '✨', color: 'from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30' }
  ];

  return (
    <div className="space-y-6">
      {/* Stream Metrics Glass Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stream Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${streamMetadata.isLive ? 'bg-red-500 shadow-sm shadow-red-500 animate-pulse' : 'bg-slate-500'}`} />
              <h3 className="text-base font-extrabold text-white">{streamMetadata.isLive ? 'LIVE ON AIR' : 'OFFLINE'}</h3>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 backdrop-blur-md">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05] col-span-2 lg:col-span-1 xl:col-span-2">
          <div className="space-y-1 overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stream Title</span>
            <h3 className="text-base font-extrabold text-white truncate" title={streamMetadata.streamTitle || 'No Title Set'}>
              {streamMetadata.streamTitle || 'No Title Set'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 backdrop-blur-md shrink-0">
            <Tv className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</span>
            <h3 className="text-xl font-extrabold text-white">{streamMetadata.subscriberCount.toLocaleString()}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-300 backdrop-blur-md shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Viewers</span>
            <h3 className="text-xl font-extrabold text-white">{streamMetadata.viewerCount.toLocaleString()}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 backdrop-blur-md shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bot Persona</span>
            <h3 className="text-base font-extrabold text-purple-300 flex items-center gap-1.5">
              <span>{activePersonality.icon}</span>
              <span className="truncate max-w-[110px]">{activePersonality.label.split(' ')[0]}</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 backdrop-blur-md shrink-0">
            <Bot className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center justify-between transition-all hover:bg-white/[0.05]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Currency in Play</span>
            <h3 className="text-xl font-extrabold text-amber-400 flex items-center gap-1">
              <span>{economy.currencySymbol}</span>
              <span>{viewers.reduce((acc, v) => acc + v.points, 0).toLocaleString()}</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 backdrop-blur-md shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Command Center: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Hub & Bot Persona Switcher & Soundboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Matrix */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Live Broadcast Trigger Hub
              </h2>
              <span className="text-[11px] text-slate-400">1-click Stream Deck / Hotkey controls</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onTriggerOverlayAlert('shoutout')}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 text-left transition-all group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">📣</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shadow-sm shadow-cyan-400" />
                </div>
                <div className="text-xs font-bold text-white">Shoutout Alert</div>
                <div className="text-[10px] text-slate-400">Trigger OBS banner</div>
              </button>

              <button
                onClick={() => onTriggerOverlayAlert('confetti')}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 text-left transition-all group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">🎉</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform shadow-sm shadow-purple-400" />
                </div>
                <div className="text-xs font-bold text-white">Confetti Blast</div>
                <div className="text-[10px] text-slate-400">Celebration FX</div>
              </button>

              <button
                onClick={() => onTriggerOverlayAlert('cookies')}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 text-left transition-all group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">🍪</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shadow-sm shadow-amber-400" />
                </div>
                <div className="text-xs font-bold text-white">Cookie Drop</div>
                <div className="text-[10px] text-slate-400">Reward chat rain</div>
              </button>

              <button
                onClick={() => onTriggerOverlayAlert('achievement')}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/40 text-left transition-all group cursor-pointer backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">🏆</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform shadow-sm shadow-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white">Unlock Pop-up</div>
                <div className="text-[10px] text-slate-400">Xbox / PS Trophy</div>
              </button>
            </div>
          </div>

          {/* Quick Bot Mood Selector */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                Active Bot Personality Style
              </h2>
              <button
                onClick={() => onNavigateTab('personalities')}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Customize Styles &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {personalities.slice(0, 8).map((p) => {
                const isSelected = p.id === activePersonality.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPersonality(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400/60 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-white">{p.label.split(' ')[0]}</div>
                      <div className="text-[9px] text-slate-400 truncate">{p.description.slice(0, 22)}...</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotkey Soundboard Pads */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Instant Stream Soundboard (Web Audio Synthesizer)
              </h2>
              <span className="text-[10px] text-slate-400">Zero external mp3 download needed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {soundPads.map((pad) => (
                <button
                  key={pad.preset}
                  onClick={() => soundSynth.play(pad.preset)}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 flex items-center gap-3 transition-all active:scale-95 group text-left cursor-pointer backdrop-blur-md"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${pad.color} border flex items-center justify-center text-white text-base shadow-sm shrink-0 backdrop-blur-md`}>
                    {pad.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{pad.label}</div>
                    <div className="text-[10px] text-slate-400">Play FX</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* OBS Studio Live Scenes */}
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                OBS Scene Switcher
              </h2>
              <button
                onClick={() => onNavigateTab('obs')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                OBS Settings &rarr;
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {obsConfig.scenes.map((scene) => {
                const isActive = scene === obsConfig.currentScene;
                return (
                  <button
                    key={scene}
                    onClick={() => onSwitchScene(scene)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                        : 'bg-white/[0.02] border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-500'}`} />
                    <span>{scene}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat & Quick Bot Tester */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Live Chat Stream</h3>
              </div>
              <button
                onClick={() => onNavigateTab('liveviewer')}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                Expand Feed &rarr;
              </button>
            </div>

            {/* Messages feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1">
              {chatMessages.slice(-8).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl text-xs space-y-1 backdrop-blur-md ${
                    msg.isBot
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-white/[0.02] border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={msg.isBot ? 'text-purple-300 font-extrabold' : 'text-slate-200'}>
                        {msg.displayName}
                      </span>
                      {msg.role === 'owner' && <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-300 border border-red-500/30">HOST</span>}
                      {msg.role === 'moderator' && <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30">MOD</span>}
                      {msg.role === 'vip' && <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">VIP</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Quick Chat Tester Input */}
            <form onSubmit={handleQuickSend} className="mt-3 pt-3 border-t border-white/[0.08] flex gap-2">
              <input
                type="text"
                placeholder="Test chat (e.g. !points, !gamble 100, !heist)..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-sm border border-purple-400/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
