import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Star,
  Zap,
  Flame,
  Coins,
  RefreshCw,
  Gift,
  Megaphone,
  Check,
  Filter,
  Users,
  MessageCircle,
  Youtube,
  Crown,
  Radio,
  Clock,
  Activity,
  UserCheck,
  Trash2,
  Award
} from 'lucide-react';
import { ChatMessage, ViewerProfile, UserRole, BotPersonality, EconomySettings, StreamMetadata, AppSettings, StreamConnectionType } from '../types';
import { ApiQuotaSection } from './ApiQuotaSection';

interface LiveChatMonitorProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string, senderRole?: UserRole, senderName?: string) => void;
  viewers: ViewerProfile[];
  onGivePoints: (username: string, amount: number) => void;
  onRoastUser: (username: string) => void;
  onShoutoutUser: (username: string) => void;
  activePersonality: BotPersonality;
  economy: EconomySettings;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  streamMetadata?: StreamMetadata;
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
  onUpdateStreamMetadata?: (meta: StreamMetadata) => void;
  onClearChat?: () => void;
}

export const LiveChatMonitor: React.FC<LiveChatMonitorProps> = ({
  chatMessages,
  onSendMessage,
  viewers,
  onGivePoints,
  onRoastUser,
  onShoutoutUser,
  activePersonality,
  economy,
  isSimulating,
  onToggleSimulation,
  streamMetadata,
  settings,
  onUpdateSettings,
  onUpdateStreamMetadata,
  onClearChat
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'bot' | 'moderator' | 'vip' | 'subscriber' | 'viewer'>('owner');
  const [selectedViewer, setSelectedViewer] = useState<ViewerProfile | null>(null);
  const [pointsInput, setPointsInput] = useState('250');
  const [chatFilter, setChatFilter] = useState<'all' | 'chat_only' | 'bot_only'>('all');
  const [showQuotaBanner, setShowQuotaBanner] = useState(true);

  const hostName = streamMetadata?.channelName || settings?.streamerName || 'MRADDICTIVE';
  const hostHandle = streamMetadata?.streamerAuth?.channelHandle || settings?.channelHandle || '@MRADDICTIVE';
  const botName = streamMetadata?.botAuth?.accountName || settings?.botAccountName || 'DroidBot';
  const botHandle = streamMetadata?.botAuth?.botChannelHandle || settings?.botChannelHandle || '@DroidBotLive';
  const autoWelcomeActive = settings?.autoWelcomeViewers ?? true;
  const streamType = settings?.targetStreamType || 'live';

  const handleToggleAutoWelcome = () => {
    if (settings && onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        autoWelcomeViewers: !autoWelcomeActive
      });
    }
  };

  const handleSelectStreamType = (type: StreamConnectionType) => {
    if (settings && onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        targetStreamType: type
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let role: UserRole = 'owner';
    let name = hostName;

    if (selectedRole === 'bot') {
      role = 'moderator';
      name = botName;
    } else if (selectedRole === 'owner') {
      role = 'owner';
      name = hostName;
    } else if (selectedRole === 'moderator') {
      role = 'moderator';
      name = 'PixelKnight';
    } else if (selectedRole === 'vip') {
      role = 'vip';
      name = 'Luna_Starlight';
    } else if (selectedRole === 'subscriber') {
      role = 'subscriber';
      name = 'CyberNova';
    } else {
      role = 'viewer';
      name = 'Chatter_99';
    }

    onSendMessage(inputText, role, name);
    setInputText('');
  };

  const getRoleBadge = (role: UserRole, isBot?: boolean) => {
    if (isBot) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/25 text-purple-300 border border-purple-500/40 flex items-center gap-1">
          🤖 BOT (MOD)
        </span>
      );
    }
    switch (role) {
      case 'owner':
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            👑 HOST
          </span>
        );
      case 'moderator':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">MOD</span>;
      case 'vip':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">VIP</span>;
      case 'subscriber':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SUB</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/10 text-slate-300 border border-white/10">VIEWER</span>;
    }
  };

  // Filter messages based on the active view filter
  const filteredMessages = (chatMessages ?? []).filter((msg) => {
    if (chatFilter === 'bot_only') return msg.isBot;
    if (chatFilter === 'chat_only') return !msg.isBot;
    return true;
  });

  const botCount = (chatMessages ?? []).filter((m) => m.isBot).length;
  const userCount = (chatMessages ?? []).filter((m) => !m.isBot).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Left 2 Cols: Main Chat Monitor */}
      <div className="lg:col-span-2 space-y-4">
        {/* TOP ACCOUNT TOPOLOGY BANNER: Host vs Bot */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900/80 via-purple-950/30 to-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-400 font-semibold">Broadcaster (Host):</span>
            <span className="font-extrabold text-white flex items-center gap-1 font-mono text-red-300">
              👑 {hostHandle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Dedicated YouTube Bot:</span>
            <span className="font-extrabold text-purple-300 flex items-center gap-1 font-mono bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              🤖 {botName} ({botHandle})
            </span>
          </div>
        </div>

        {/* QUOTA METER & CONNECTION TELEMETRY BANNER */}
        {showQuotaBanner && settings && streamMetadata && (
          <ApiQuotaSection
            settings={settings}
            onUpdateSettings={onUpdateSettings || (() => {})}
            streamMetadata={streamMetadata}
            onUpdateStreamMetadata={onUpdateStreamMetadata || (() => {})}
            isCompact={true}
          />
        )}

        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex flex-col h-[680px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white">Live YouTube Chat Stream</h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono text-purple-300">
                    <Radio className="w-3 h-3 text-red-400" />
                    {streamType === 'upcoming' ? 'Scheduled / Upcoming' : streamType === 'unlisted_private' ? 'Unlisted/Private' : 'Live Broadcast'}
                  </span>
                  <span>•</span>
                  <span>Persistent Listener Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Auto Welcome New Viewers Quick Toggle */}
              <button
                type="button"
                onClick={handleToggleAutoWelcome}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  autoWelcomeActive
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm shadow-purple-500/20'
                    : 'bg-slate-800/60 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Automatically welcome first-time chatters (greetings) and returning viewers (memory facts)"
              >
                <Sparkles className={`w-3.5 h-3.5 ${autoWelcomeActive ? 'text-purple-300 animate-pulse' : 'text-slate-500'}`} />
                <span>Auto-Welcome: {autoWelcomeActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onToggleSimulation}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                  isSimulating
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Chat Active (Auto)' : 'Start Chat Sim'}</span>
              </button>
            </div>
          </div>

          {/* VIEW FILTER TOOLBAR: All vs Live Chat Only vs Bot Replies Only */}
          <div className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-purple-400" /> Filter:
              </span>

              {/* All Messages */}
              <button
                onClick={() => setChatFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  chatFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>All Messages</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                  {(chatMessages?.length ?? 0)}
                </span>
              </button>

              {/* Live Chat Only (Chatters Only) */}
              <button
                onClick={() => setChatFilter('chat_only')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  chatFilter === 'chat_only'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                <span>Live Chat Only</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                  {userCount}
                </span>
              </button>

              {/* Bot Replies Only */}
              <button
                onClick={() => setChatFilter('bot_only')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  chatFilter === 'bot_only'
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-pink-300" />
                <span>Bot Replies Only</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">
                  {botCount}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:block text-[10px] text-slate-500 font-mono pr-2">
                  Viewing {(filteredMessages?.length ?? 0)} items
                </div>
                {onClearChat && (
                  <button
                    onClick={onClearChat}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Chat</span>
                  </button>
                )}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
            {filteredMessages.map((msg) => {
              const viewerProfile = viewers.find((v) => v.username.toLowerCase() === msg.username.toLowerCase());
              const isSuper = msg.isSuperChat;
              const isMember = msg.isNewMember;
              
              let cardStyle = 'bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.06]';
              if (msg.isBot) {
                cardStyle = 'bg-purple-950/30 border border-purple-500/30 shadow-md shadow-purple-950/25';
              } else if (isSuper) {
                cardStyle = 'bg-gradient-to-r from-amber-500/15 to-yellow-600/10 border border-amber-400/50 shadow-md shadow-amber-950/30';
              } else if (isMember) {
                cardStyle = 'bg-gradient-to-r from-emerald-500/15 to-teal-600/10 border border-emerald-400/50 shadow-md shadow-emerald-950/30';
              }

              return (
                <div
                  key={msg.id}
                  onClick={() => viewerProfile && setSelectedViewer(viewerProfile)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer backdrop-blur-md ${cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {msg.isBot ? (
                        <div className="w-5 h-5 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs">
                          🤖
                        </div>
                      ) : viewerProfile?.profilePictureUrl ? (
                        <img src={viewerProfile.profilePictureUrl} alt={msg.displayName} className="w-5 h-5 rounded-lg object-cover" />
                      ) : (
                        <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${viewerProfile?.avatarColor || 'from-purple-500 to-indigo-600'} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {msg.displayName[0]}
                        </div>
                      )}
                      <span className="font-extrabold text-xs text-white">
                        {msg.displayName}
                      </span>
                      {getRoleBadge(msg.role, msg.isBot)}
                      {isSuper && (
                        <span className="text-[10px] text-amber-950 bg-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400 shadow-sm animate-pulse">
                          ⭐ SUPER CHAT {msg.superChatAmount}
                        </span>
                      )}
                      {isMember && (
                        <span className="text-[10px] text-emerald-950 bg-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400 shadow-sm animate-pulse">
                          🎉 NEW MEMBER
                        </span>
                      )}
                      {viewerProfile?.customFacts?.length ? (
                        <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          <Sparkles className="w-2.5 h-2.5" /> Memory Infused
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{msg.content}</p>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No messages found matching the filter "{chatFilter}".</p>
              </div>
            )}
          </div>

          {/* Chat test bar */}
          <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-400 text-[11px] font-semibold">Post As:</span>
              <button
                type="button"
                onClick={() => setSelectedRole('owner')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md flex items-center gap-1 ${
                  selectedRole === 'owner'
                    ? 'bg-red-500/25 text-red-200 border border-red-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>👑 Host ({hostName})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('bot')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md flex items-center gap-1 ${
                  selectedRole === 'bot'
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>🤖 Bot ({botName})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('moderator')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md ${
                  selectedRole === 'moderator'
                    ? 'bg-blue-500/25 text-blue-200 border border-blue-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>🛡️ Mod</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('vip')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md ${
                  selectedRole === 'vip'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>⭐ VIP</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('subscriber')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md ${
                  selectedRole === 'subscriber'
                    ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>💎 Sub</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('viewer')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer backdrop-blur-md ${
                  selectedRole === 'viewer'
                    ? 'bg-slate-500/25 text-slate-200 border border-slate-400/50 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>💬 Viewer</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message or command (!points, !gamble 100, !heist, !boss, !so @user, !roast @user)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 border border-purple-400/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Viewer Inspector / Quick Actions */}
      <div className="space-y-4">
        {selectedViewer ? (
          <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-purple-400/30 space-y-4 shadow-xl shadow-purple-950/20">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedViewer.avatarColor || 'from-purple-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {selectedViewer.displayName[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{selectedViewer.displayName}</h3>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    {getRoleBadge(selectedViewer.role)}
                    <span className="text-[11px] text-amber-300 font-bold">{selectedViewer.points} {economy.currencySymbol}</span>
                  </div>
                </div>
              </div>
            </div>

             {/* Custom Memory Facts */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Stored Memory Facts for Bot Responses:
              </span>
              <div className="space-y-1.5">
                {selectedViewer.customFacts?.map((fact, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-200">
                    "{fact}"
                  </div>
                ))}
                {(!selectedViewer.customFacts || selectedViewer.customFacts.length === 0) && (
                  <div className="text-[11px] text-slate-500 italic p-2 bg-white/[0.01] rounded-lg">
                    No custom facts recorded. Add in Viewer Profiles tab!
                  </div>
                )}
              </div>
            </div>

            {/* Badges & Inventory */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                Badges & Inventory ({selectedViewer.inventory?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedViewer.inventory?.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-1.5 text-[11px]"
                    title={`${badge.name} - Acquired: ${badge.acquiredAt}`}
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className="font-semibold text-slate-200">{badge.name}</span>
                  </div>
                ))}
                {(!selectedViewer.inventory || selectedViewer.inventory.length === 0) && (
                  <div className="text-[11px] text-slate-500 italic p-2 bg-white/[0.01] rounded-lg w-full">
                    No custom badges awarded yet. Award them in Viewer Profiles tab!
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions on this viewer */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Stream Actions:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onRoastUser(selectedViewer.username)}
                  className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-200 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Roast User</span>
                </button>

                <button
                  onClick={() => onShoutoutUser(selectedViewer.username)}
                  className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
                >
                  <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shoutout</span>
                </button>
              </div>

              {/* Add points */}
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-24 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
                />
                <button
                  onClick={() => onGivePoints(selectedViewer.username, parseInt(pointsInput, 10) || 100)}
                  className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Gift Points</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 text-center space-y-3 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
            <User className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-xs text-slate-400 leading-relaxed">
              Click any chatter in the live feed to inspect their stored memories, stats, or execute targeted roasts and shoutouts!
            </div>
          </div>
        )}

        {/* Bot Personality Quick Glance */}
        <div className="p-5 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 space-y-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-white">Active Personality</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-purple-400/30">
            <span className="text-2xl">{activePersonality.icon}</span>
            <div>
              <div className="text-xs font-bold text-purple-300">{activePersonality.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{activePersonality.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
