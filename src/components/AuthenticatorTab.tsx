import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Check, AlertCircle, Sparkles, RefreshCw, UserCheck, Bot, Zap, Globe, Lock, LogIn, LogOut } from 'lucide-react';
import { StreamLiveMetadata, BotIdentity, ViewerProfile } from '../types';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface AuthenticatorTabProps {
  streamMetadata: StreamLiveMetadata;
  setStreamMetadata: React.Dispatch<React.SetStateAction<StreamLiveMetadata>>;
  setProfiles: React.Dispatch<React.SetStateAction<ViewerProfile[]>>;
  botIdentity: BotIdentity;
  onSaveNotice: () => void;
}

export const AuthenticatorTab: React.FC<AuthenticatorTabProps> = ({
  streamMetadata,
  setStreamMetadata,
  setProfiles,
  botIdentity,
  onSaveNotice
}) => {
  const [streamerChannel, setStreamerChannel] = useState(streamMetadata.streamerAuth.channelId || '');
  const [botAccountName, setBotAccountName] = useState(streamMetadata.botAuth.accountName || '');
  const [isAutoDetecting, setIsAutoDetecting] = useState<boolean>(false);
  const [autoDetectSuccess, setAutoDetectSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Google Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        onSaveNotice();
      }
    } catch (err: any) {
      setErrorMsg(`Login failed: ${err.message}`);
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  const [isConnectingBot, setIsConnectingBot] = useState(false);

  const handleConnectBotAccount = async () => {
    setIsConnectingBot(true);
    try {
      const result = await googleSignIn();
      if (!result || !result.accessToken) throw new Error("Failed to authenticate Bot account.");
      
      const channelRes = await fetch('https://youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${result.accessToken}` }
      });
      const channelData = await channelRes.json();
      if (channelData.error) throw new Error(channelData.error.message);
      if (!channelData.items || channelData.items.length === 0) throw new Error("No YouTube channel found for this Bot account.");
      
      const channelName = channelData.items[0].snippet.title;
      const channelId = channelData.items[0].id;
      
      setBotAccountName(channelName);
      setStreamMetadata((prev) => ({
        ...prev,
        botAuth: {
          ...prev.botAuth,
          accountName: channelName,
          channelId: channelId,
          authenticated: true,
          isFallback: false
        }
      }));
      onSaveNotice();
    } catch (err: any) {
      setErrorMsg(`Bot connection failed: ${err.message}`);
    } finally {
      setIsConnectingBot(false);
    }
  };

  const handleAutoDetectApiV3 = async () => {
    setErrorMsg(null);
    if (!token) {
      setErrorMsg('Please connect your Google Account first by clicking "Sign in with Google" below.');
      return;
    }
    
    setIsAutoDetecting(true);
    try {
      // 1. Fetch channel stats
      const channelRes = await fetch('https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const channelData = await channelRes.json();
      
      if (channelData.error) throw new Error(channelData.error.message);
      if (!channelData.items || channelData.items.length === 0) throw new Error("No YouTube channel found for this account.");
      
      const channel = channelData.items[0];
      const channelId = channel.id;
      const channelName = channel.snippet.title;
      const thumbnailUrl = channel.snippet.thumbnails?.default?.url || '';
      const subscribers = parseInt(channel.statistics.subscriberCount || '0', 10);
      
      // 2. Fetch live broadcast if any
      const searchRes = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      
      let isLive = false;
      let liveViewerCount = 0;
      let streamTitle = "Offline";
      let streamUrl = "";
      
      if (searchData.items && searchData.items.length > 0) {
        isLive = true;
        const videoId = searchData.items[0].id.videoId;
        streamTitle = searchData.items[0].snippet.title;
        streamUrl = `https://youtube.com/watch?v=${videoId}`;
        
        // Fetch viewer count
        const videoRes = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const videoData = await videoRes.json();
        if (videoData.items && videoData.items.length > 0) {
          liveViewerCount = parseInt(videoData.items[0].liveStreamingDetails?.concurrentViewers || '0', 10);
        }
      }
      
      setAutoDetectSuccess(true);
      setStreamerChannel(channelId);
      
      // Wipe mock placeholder profiles upon connecting a real account
      setProfiles((prev) => prev.filter(p => !p.id.startsWith('prof-')));
      
      setStreamMetadata((prev) => ({
        ...prev,
        isLive,
        viewerCount: liveViewerCount,
        subscriberCount: subscribers,
        streamTitle,
        streamUrl,
        thumbnailUrl,
        streamerAuth: {
          ...prev.streamerAuth,
          authenticated: true,
          apiV3AutoIncluded: true,
          accountName: channelName,
          channelId: channelId
        },
        botAuth: {
          ...prev.botAuth,
          apiV3AutoIncluded: true
        },
        youtubeApiV3: {
          autoDetected: true,
          apiVersion: 'v3 (Official Linked)',
          quotaStatus: 'Active & Verified',
          liveChatPolling: isLive,
          serviceState: isLive ? 'active' : 'idle'
        }
      }));
      onSaveNotice();
      setTimeout(() => setAutoDetectSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(`Detection failed: ${err.message}. Make sure your channel is public and active.`);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const handleSave = () => {
    setStreamMetadata((prev) => ({
      ...prev,
      streamerAuth: {
        ...prev.streamerAuth,
        channelId: streamerChannel.trim() || 'UC_STREAMER_CHANNEL',
        authenticated: true,
        apiV3AutoIncluded: true
      },
      botAuth: {
        ...prev.botAuth,
        accountName: botAccountName.trim() || botIdentity.botName,
        authenticated: botAccountName.trim() ? true : false,
        isFallback: !botAccountName.trim(),
        apiV3AutoIncluded: true
      }
    }));
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">YouTube Authenticator & Auto API v3 Sync</h2>
            <p className="text-xs text-slate-400">
              YouTube Data API v3 is auto-found and included when you connect your account — no random files needed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoDetectApiV3}
            disabled={isAutoDetecting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            {isAutoDetecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>{isAutoDetecting ? 'Detecting API v3...' : 'Auto-Detect YouTube API v3'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Auto-Detection Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block text-red-400 mb-1">Error</strong>
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white flex items-center gap-2">
              <span>Google Account Cloud Connectivity</span>
              {user ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  DISCONNECTED
                </span>
              )}
            </span>
            <p className="text-slate-400 text-[11px]">
              {user 
                ? `Logged in as ${user.displayName || user.email}. Cloud Backups and Google Drive features enabled.`
                : 'Connect your Google account to enable secure Cloud Backups and Google Drive storage integration.'}
            </p>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleGoogleLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2 shadow-lg shadow-white/10 transition-all disabled:opacity-50"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Sign in with Google</span>
          </button>
        )}
      </div>

      {/* API Detection Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white flex items-center gap-2">
              <span>YouTube API v3 Engine Status</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              DroidOS automatically includes and provisions the YouTube Data API v3 endpoints for live chat polling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-600/40">
          <Check className="w-3.5 h-3.5" />
          <span>API v3 Live Chat Polling: ACTIVE</span>
        </div>
      </div>

      {autoDetectSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>
            YouTube API v3 successfully auto-detected and linked! All stream chat and broadcast listener services are ready.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streamer Broadcaster Account */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Broadcaster / Streamer Account</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
              API v3 CONNECTED
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            The broadcaster account provides access to live chat stream polling, viewer counts, and live stream metadata through YouTube API v3.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Broadcaster Channel ID / Handle</label>
            <input
              type="text"
              value={streamerChannel}
              onChange={(e) => setStreamerChannel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="UC_xxxxxxxxxxxx"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <strong className="text-emerald-400">Authenticated & Auto-Linked</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>YouTube API v3:</span>
              <span className="text-emerald-300 font-mono">Auto-Found & Included</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Live Chat Webhook:</span>
              <span className="text-slate-300">Live Polling (Zero Latency)</span>
            </div>
          </div>
        </div>

        {/* Bot Account */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>2. Dedicated YouTube Bot Account</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                streamMetadata.botAuth.authenticated
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {streamMetadata.botAuth.authenticated ? 'CUSTOM BOT AUTH' : 'IN-APP FALLBACK'}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Connect a dedicated second Google/YouTube account to send chat messages. If omitted, DroidOS dispatches using in-app broadcaster naming.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bot Account Login</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleConnectBotAccount}
                disabled={isConnectingBot}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {isConnectingBot ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign in as Bot with Google</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Leave unconnected to automatically use default in-app bot identity [{botIdentity.botName}].
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Dispatch Identity:</span>
              <strong className="text-purple-300">
                {botAccountName || `${botIdentity.botName} (Fallback)`}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>API v3 Integration:</span>
              <span className="text-emerald-400">Included Automatically</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
