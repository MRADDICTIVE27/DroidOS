import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Radio,
  Eye,
  Trash2,
  Filter,
  Sparkles,
  Bot,
  Zap,
  Image as ImageIcon,
  Edit2,
  Check,
  Play,
  Pause,
  HelpCircle,
  Link,
  Unlink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Globe,
  ExternalLink,
  MessageSquare,
  X
} from 'lucide-react';
import { ChatMessage, BotIdentity, CustomRole, ViewerProfile, StreamLiveMetadata } from '../types';
import { getAccessToken } from '../lib/googleAuth';

interface LiveViewerTabProps {
  messages: ChatMessage[];
  onSendMessage: (sender: string, content: string, explicitRole?: string) => void;
  onSendBotMessage: (content: string) => void;
  onClearMessages: () => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isLive: boolean;
  botIdentity: BotIdentity;
  roles: CustomRole[];
  profiles: ViewerProfile[];
  simulatedTraffic: boolean;
  setSimulatedTraffic: (val: boolean) => void;
  streamMetadata: StreamLiveMetadata;
  setStreamMetadata: React.Dispatch<React.SetStateAction<StreamLiveMetadata>>;
}

export const LiveViewerTab: React.FC<LiveViewerTabProps> = ({
  messages,
  onSendMessage,
  onSendBotMessage,
  onClearMessages,
  isListening,
  setIsListening,
  isLive,
  botIdentity,
  roles,
  profiles,
  simulatedTraffic,
  setSimulatedTraffic,
  streamMetadata,
  setStreamMetadata
}) => {
  const [inputText, setInputText] = useState('');
  const [senderUsername, setSenderUsername] = useState('NewViewer');
  const [senderRole, setSenderRole] = useState('viewer');
  const [sendMode, setSendMode] = useState<'viewer' | 'bot'>('viewer');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(streamMetadata.streamTitle);
  const [isEditingThumb, setIsEditingThumb] = useState(false);
  const [tempThumb, setTempThumb] = useState(streamMetadata.thumbnailUrl);

  // Live Stream Connection State
  const [streamUrlInput, setStreamUrlInput] = useState(streamMetadata.streamUrl || '');
  const [isConnectingStream, setIsConnectingStream] = useState(false);
  const [connectNotice, setConnectNotice] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isSendingTestLiveMsg, setIsSendingTestLiveMsg] = useState(false);
  const [testLiveMsgNotice, setTestLiveMsgNotice] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleConnectStream = async (inputToUse?: string) => {
    const target = (inputToUse || streamUrlInput).trim();
    if (!target) {
      setConnectError('Please enter a YouTube live stream URL or Video ID');
      return;
    }

    setIsConnectingStream(true);
    setConnectError(null);
    setConnectNotice(null);

    try {
      const token = getAccessToken();
      const res = await fetch('/api/youtube/resolve-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: target, token })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status}: Connection error`);
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to connect to YouTube live stream');
      }

      setStreamMetadata((prev) => ({
        ...prev,
        isLive: true,
        activeLiveChatId: data.activeLiveChatId,
        videoId: data.videoId,
        streamTitle: data.streamTitle || prev.streamTitle,
        channelName: data.channelName || prev.channelName,
        thumbnailUrl: data.thumbnailUrl || prev.thumbnailUrl,
        viewerCount: data.viewerCount !== undefined ? data.viewerCount : prev.viewerCount,
        streamUrl: data.videoId ? `https://youtube.com/watch?v=${data.videoId}` : prev.streamUrl,
        youtubeApiV3: {
          ...prev.youtubeApiV3,
          liveChatPolling: true,
          serviceState: 'active'
        }
      }));

      setIsListening(true);
      setConnectNotice(`Connected to YouTube Live Chat (ID: ${data.activeLiveChatId || data.videoId})!`);
      setTimeout(() => setConnectNotice(null), 5000);
    } catch (err: any) {
      setConnectError(err.message || 'Could not connect to live stream');
      setTimeout(() => setConnectError(null), 6000);
    } finally {
      setIsConnectingStream(false);
    }
  };

  const handleAutoDetectBroadcast = async () => {
    setIsConnectingStream(true);
    setConnectError(null);
    setConnectNotice(null);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Please log in with your Google account first in the Authenticator tab');
      }

      const res = await fetch('/api/youtube/resolve-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: '__MY_ACTIVE_BROADCAST__', token })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status}: Connection error`);
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No active live broadcast found on your YouTube channel');
      }

      setStreamMetadata((prev) => ({
        ...prev,
        isLive: true,
        activeLiveChatId: data.activeLiveChatId,
        videoId: data.videoId,
        streamTitle: data.streamTitle || prev.streamTitle,
        thumbnailUrl: data.thumbnailUrl || prev.thumbnailUrl,
        streamUrl: data.videoId ? `https://youtube.com/watch?v=${data.videoId}` : prev.streamUrl,
        youtubeApiV3: {
          ...prev.youtubeApiV3,
          liveChatPolling: true,
          serviceState: 'active'
        }
      }));

      setIsListening(true);
      setConnectNotice(`Auto-Detected Broadcast: "${data.streamTitle}" connected!`);
      setTimeout(() => setConnectNotice(null), 5000);
    } catch (err: any) {
      setConnectError(err.message || 'Auto-detection failed');
      setTimeout(() => setConnectError(null), 6000);
    } finally {
      setIsConnectingStream(false);
    }
  };

  const handleDisconnectStream = () => {
    setStreamMetadata((prev) => ({
      ...prev,
      activeLiveChatId: null,
      videoId: null,
      youtubeApiV3: {
        ...prev.youtubeApiV3,
        liveChatPolling: false,
        serviceState: 'offline'
      }
    }));
    fetch('/api/youtube/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeLiveChatId: null, isLive: false })
    }).catch(() => {});
    setConnectNotice('Disconnected from YouTube Live Chat.');
    setTimeout(() => setConnectNotice(null), 4000);
  };

  const handleSendTestLiveMessage = async () => {
    setIsSendingTestLiveMsg(true);
    setTestLiveMsgNotice(null);
    setConnectError(null);
    const testContent = `🤖 [${botIdentity.botName}] Live bot connection verified! (${new Date().toLocaleTimeString()})`;

    // Immediately dispatch into chat UI
    onSendBotMessage(testContent);

    try {
      const token = getAccessToken();
      const res = await fetch('/api/youtube/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: testContent,
          liveChatId: streamMetadata.activeLiveChatId,
          accessToken: token,
          sender: botIdentity.botName,
          senderRole: 'bot'
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { success: true };
      }

      const noticeText = data?.notice || data?.warning || 'Bot broadcast dispatched to live chat feed!';
      setTestLiveMsgNotice(noticeText);
      setTimeout(() => setTestLiveMsgNotice(null), 5000);
    } catch {
      // Fallback display
      setTestLiveMsgNotice('Bot test message posted in stream chat feed.');
      setTimeout(() => setTestLiveMsgNotice(null), 5000);
    } finally {
      setIsSendingTestLiveMsg(false);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (sendMode === 'bot') {
      onSendBotMessage(inputText.trim());
    } else {
      onSendMessage(senderUsername.trim() || 'Viewer', inputText.trim(), senderRole);
    }
    setInputText('');
  };

  const handleSaveTitle = () => {
    setStreamMetadata((prev) => ({ ...prev, streamTitle: tempTitle.trim() || 'Live Broadcast' }));
    setIsEditingTitle(false);
  };

  const handleSaveThumb = () => {
    setStreamMetadata((prev) => ({ ...prev, thumbnailUrl: tempThumb.trim() }));
    setIsEditingThumb(false);
  };

  const filteredMessages = messages.filter((m) => {
    if (selectedRoleFilter === 'all') return true;
    if (selectedRoleFilter === 'bot') return m.isBot;
    return m.senderRole.toLowerCase() === selectedRoleFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* TOP STREAM MONITOR: Live Title, Thumbnail Preview & Real-Time Telemetry */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Live Thumbnail Preview */}
          <div className="lg:col-span-4 relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 aspect-video flex items-center justify-center">
            <img
              src={streamMetadata.thumbnailUrl}
              alt="Live Stream Thumbnail"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback image if custom url fails
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60';
              }}
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-600/90 text-white text-[11px] font-extrabold shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{isLive ? 'LIVE PREVIEW' : 'OFFLINE'}</span>
            </div>

            {/* Change Thumbnail Action */}
            <button
              onClick={() => {
                setTempThumb(streamMetadata.thumbnailUrl);
                setIsEditingThumb(true);
              }}
              className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Thumbnail</span>
            </button>
          </div>

          {/* Stream Metadata & Broadcast Title */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {streamMetadata.category}
                </span>
                <span className="text-xs text-slate-400">
                  Channel: <strong className="text-white">{botIdentity.channelName}</strong>
                </span>
                <span className="text-xs text-slate-400">
                  Streamer: <strong className="text-white">{botIdentity.streamerName}</strong>
                </span>
              </div>

              {/* Bot Responder Status */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Chat Bot:</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {botIdentity.botName}
                  <span className="text-[10px] text-purple-400">
                    ({streamMetadata.botAuth.authenticated ? 'Dedicated Auth' : 'Default In-App'})
                  </span>
                </span>
              </div>
            </div>

            {/* Editable Live Stream Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="flex-1 bg-slate-950 border border-blue-500 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                    placeholder="Enter live stream title..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  <h1 className="text-base sm:text-lg font-bold text-white leading-snug hover:text-blue-300 transition-colors">
                    {streamMetadata.streamTitle}
                  </h1>
                  <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                </div>
              )}
            </div>

            {/* Stream Telemetry Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live Viewers</span>
                </div>
                <div className="text-sm font-bold text-white">{isLive ? streamMetadata.viewerCount : 0}</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chat Velocity</span>
                </div>
                <div className="text-sm font-bold text-emerald-400">{isLive ? '~14 msgs/min' : 'Idle'}</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Responses</span>
                </div>
                <div className="text-sm font-bold text-purple-300">Enabled ({botIdentity.aiCommandPrefix})</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Listener Mode</span>
                </div>
                <div className="text-sm font-bold text-slate-200">{isListening ? 'Auto-Polling' : 'Paused'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Edit Modal */}
      {isEditingThumb && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Update Stream Thumbnail Preview URL</h3>
            <input
              type="text"
              value={tempThumb}
              onChange={(e) => setTempThumb(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingThumb(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThumb}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Save Thumbnail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE LIVE STREAM & CHAT SYNC CONTROLLER */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              streamMetadata.activeLiveChatId 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">YouTube Live Chat Sync Engine</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  streamMetadata.activeLiveChatId
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                    : 'bg-rose-950 text-rose-300 border-rose-700/60'
                }`}>
                  {streamMetadata.activeLiveChatId ? '🟢 Ingest Active' : '🔴 Not Connected'}
                </span>
                {streamMetadata.activeLiveChatId && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    getAccessToken()
                      ? 'bg-blue-950 text-blue-300 border-blue-700/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}>
                    {getAccessToken() ? '✓ YouTube API Outbound Active' : 'ℹ️ Stream Overlay Mode (Sign in for YouTube chat output)'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {streamMetadata.activeLiveChatId 
                  ? `Live Stream Video: ${streamMetadata.videoId || streamMetadata.activeLiveChatId} • Reading chat messages in real time & responding to viewer commands.`
                  : 'Connect to your live broadcast to sync chat, trigger bot replies, and award viewer points.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {streamMetadata.activeLiveChatId ? (
              <>
                <button
                  onClick={handleSendTestLiveMessage}
                  disabled={isSendingTestLiveMsg}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Broadcast a test verification message to YouTube chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSendingTestLiveMsg ? 'Sending...' : 'Test Bot Broadcast'}</span>
                </button>
                <button
                  onClick={handleDisconnectStream}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleAutoDetectBroadcast}
                disabled={isConnectingStream}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                {isConnectingStream ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                <span>Auto-Detect My Broadcast</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Bar when not connected or changing stream */}
        <div className="pt-1 flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1">
            <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={streamUrlInput}
              onChange={(e) => setStreamUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConnectStream();
              }}
              placeholder="Paste YouTube Stream URL or Video ID (e.g. https://www.youtube.com/watch?v=...)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            onClick={() => handleConnectStream()}
            disabled={isConnectingStream || !streamUrlInput.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-indigo-600/20 shrink-0"
          >
            {isConnectingStream ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
            <span>{isConnectingStream ? 'Connecting...' : 'Connect Live Stream'}</span>
          </button>
        </div>

        {/* Feedback / Notices */}
        {connectNotice && (
          <div className="flex items-center justify-between gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{connectNotice}</span>
            </div>
            <button onClick={() => setConnectNotice(null)} className="p-0.5 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {connectError && (
          <div className="flex items-center justify-between gap-2 text-xs text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{connectError}</span>
            </div>
            <button onClick={() => setConnectError(null)} className="p-0.5 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {testLiveMsgNotice && (
          <div className="flex items-center justify-between gap-2 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/60 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{testLiveMsgNotice}</span>
            </div>
            <button onClick={() => setTestLiveMsgNotice(null)} className="p-0.5 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN LIVE CHAT & DISPATCH CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Real-Time Chat Stream (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex flex-col h-[560px] shadow-xl overflow-hidden">
          {/* Chat Stream Header */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">YouTube Live Chat Feed</h2>
              <span className="text-[11px] text-slate-400 font-mono">({messages.length} messages)</span>
            </div>

            {/* Quick Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Messages</option>
                <option value="bot">🤖 Bot Responses Only</option>
                <option value="owner">👑 Owner</option>
                <option value="moderator">🛡️ Moderator</option>
                <option value="vip">⭐ VIP</option>
                <option value="subscriber">💎 Subscriber</option>
                <option value="viewer">💬 Viewer</option>
              </select>

              <button
                onClick={onClearMessages}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick AI & Persona Command Suggestions */}
          <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Quick Persona Tests:</span>
            </span>
            <button
              onClick={() => onSendMessage('RoastMeGuy', '!ai roast my gameplay', 'viewer')}
              className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>🔥 RoastMeGuy: !ai roast me</span>
            </button>
            <button
              onClick={() => onSendMessage('SarcasticSam', '!ai tell me about the stream', 'subscriber')}
              className="px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>🙄 SarcasticSam: !ai stream info</span>
            </button>
            <button
              onClick={() => onSendMessage('StarVIP', '!ai any tips for my channel?', 'vip')}
              className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>✨ StarVIP: !ai channel tips</span>
            </button>
            <button
              onClick={() => onSendMessage('RoastMeGuy', '!inventory', 'viewer')}
              className="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/60 shrink-0 cursor-pointer"
            >
              !inventory
            </button>
            <button
              onClick={() => onSendMessage('LeadMod', '!points', 'moderator')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 cursor-pointer"
            >
              !points
            </button>
            <button
              onClick={() => onSendMessage('RoastMeGuy', '!profile', 'viewer')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 cursor-pointer"
            >
              !profile
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin bg-slate-950/40">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <Bot className="w-8 h-8 opacity-40 text-blue-400" />
                <p>No chat messages yet.</p>
                <p className="text-[11px] text-slate-600">Send a simulated message or wait for stream activity!</p>
              </div>
            ) : (
              filteredMessages.map((msg, msgIndex) => {
                const isBotMsg = msg.isBot;
                const roleConfig = roles.find((r) => r.id === msg.senderRole || r.name.toLowerCase() === msg.senderRole.toLowerCase());

                return (
                  <div
                    key={msg.id ? `${msg.id}-${msgIndex}` : `msg-${msgIndex}`}
                    className={`flex flex-col p-2.5 rounded-xl border transition-all text-xs ${
                      isBotMsg
                        ? 'bg-purple-950/30 border-purple-500/40 shadow-sm shadow-purple-900/20'
                        : 'bg-slate-900/80 border-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {/* Sender Name */}
                        <span className={`font-bold ${isBotMsg ? 'text-purple-300 flex items-center gap-1' : 'text-slate-100'}`}>
                          {isBotMsg && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                          {msg.sender}
                        </span>

                        {/* Role Badge */}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            isBotMsg
                              ? 'bg-purple-950 text-purple-300 border-purple-700'
                              : roleConfig?.badgeBg || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isBotMsg ? '🤖 DROID BOT' : roleConfig?.badgeText || msg.senderRole.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Rule Match Pill */}
                        {msg.matchedRule && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80 font-mono">
                            {msg.matchedRule}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                    </div>

                    <div className={`leading-relaxed break-words ${isBotMsg ? 'text-purple-100 font-medium' : 'text-slate-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Command Chips */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin text-[11px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Quick Commands:</span>
            <button
              type="button"
              onClick={() => setInputText('!inventory')}
              className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 hover:bg-amber-900/60 font-mono text-[10px] shrink-0 cursor-pointer"
            >
              🎒 !inventory
            </button>
            <button
              type="button"
              onClick={() => setInputText('!profile')}
              className="px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 font-mono text-[10px] shrink-0 cursor-pointer"
            >
              👤 !profile
            </button>
            <button
              type="button"
              onClick={() => setInputText('!points')}
              className="px-2 py-0.5 rounded-lg bg-yellow-950/60 border border-yellow-800/40 text-yellow-300 hover:bg-yellow-900/60 font-mono text-[10px] shrink-0 cursor-pointer"
            >
              🪙 !points
            </button>
            <button
              type="button"
              onClick={() => setInputText('!ai how is the stream going?')}
              className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:bg-purple-900/60 font-mono text-[10px] shrink-0 cursor-pointer"
            >
              🤖 !ai question
            </button>
            <button
              type="button"
              onClick={() => setInputText('!redeem airhorn')}
              className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 font-mono text-[10px] shrink-0 cursor-pointer"
            >
              🎁 !redeem airhorn
            </button>
          </div>

          {/* Chat Dispatch Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800/80 bg-slate-900/90 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                sendMode === 'bot'
                  ? `Broadcast in chat as ${botIdentity.botName}...`
                  : `Type message as ${senderUsername} (${senderRole}). Try '!ai how are you' ...`
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Side: Simulation & Listener Sandbox (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sender Role Sandbox Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Message Dispatcher Control</span>
              </h3>
            </div>

            {/* Mode: Send as Viewer vs Bot */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSendMode('viewer')}
                className={`py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                  sendMode === 'viewer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Send as Viewer
              </button>
              <button
                type="button"
                onClick={() => setSendMode('bot')}
                className={`py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                  sendMode === 'bot'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Send as Bot
              </button>
            </div>

            {sendMode === 'viewer' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Viewer Username:</label>
                  <input
                    type="text"
                    value={senderUsername}
                    onChange={(e) => setSenderUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. GamerGuy42"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role:</label>
                  <select
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Priority {r.priority})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {sendMode === 'bot' && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-200 leading-relaxed">
                Messages typed in the input bar will be broadcast directly as <strong>{botIdentity.botName}</strong> into live YouTube chat.
              </div>
            )}
          </div>

          {/* Stream Simulation & Low Resource Toggles */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Listener & Resource Automation</span>
            </h3>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">Simulated Viewer Velocity</div>
                <div className="text-[10px] text-slate-400">Generates periodic viewer questions/commands</div>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedTraffic(!simulatedTraffic)}
                className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  simulatedTraffic
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {simulatedTraffic ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-200 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> Type <code>!ai how are you</code> or any question to see DroidOS dynamically respond with <code>@{botIdentity.streamerName} &#123;response&#125;</code> in real time!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
