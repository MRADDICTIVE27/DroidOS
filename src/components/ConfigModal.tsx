import React, { useState } from 'react';
import { Shield, Key, FileJson, CheckCircle2, Copy, Check, Radio, Bot, AlertCircle, Cpu } from 'lucide-react';
import { StreamLiveMetadata, BotIdentity } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamMetadata: StreamLiveMetadata;
  setStreamMetadata: React.Dispatch<React.SetStateAction<StreamLiveMetadata>>;
  botIdentity: BotIdentity;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  streamMetadata,
  setStreamMetadata,
  botIdentity
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'streamer' | 'bot' | 'apikeys'>('streamer');
  const [copied, setCopied] = useState<boolean>(false);
  const [streamerChannelInput, setStreamerChannelInput] = useState<string>(streamMetadata.streamerAuth.accountName);
  const [botAccountInput, setBotAccountInput] = useState<string>(
    streamMetadata.botAuth.authenticated ? streamMetadata.botAuth.accountName : ''
  );
  const [ecoMode, setEcoMode] = useState<boolean>(true);

  if (!isOpen) return null;

  const mockSecretJson = `{
  "installed": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "droidos-stream-assistant",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "client_secret": "GOCSPX-YOUR_CLIENT_SECRET",
    "redirect_uris": ["http://localhost:3000/oauth2callback"]
  }
}`;

  const copyJson = () => {
    navigator.clipboard.writeText(mockSecretJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStreamerAuth = () => {
    setStreamMetadata((prev) => ({
      ...prev,
      streamerAuth: {
        ...prev.streamerAuth,
        authenticated: !prev.streamerAuth.authenticated,
        accountName: streamerChannelInput || 'Streamer (Broadcaster)'
      }
    }));
  };

  const handleToggleBotAuth = () => {
    const nextAuth = !streamMetadata.botAuth.authenticated;
    setStreamMetadata((prev) => ({
      ...prev,
      botAuth: {
        ...prev.botAuth,
        authenticated: nextAuth,
        accountName: nextAuth ? botAccountInput || 'Dedicated Bot Account' : `${botIdentity.botName} (Default In-App)`,
        isFallback: !nextAuth
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">YouTube Dual Auth & Credentials</h3>
              <p className="text-[11px] text-slate-400">Streamer Broadcaster Auth • Chat Bot Auth • API Secrets</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm cursor-pointer">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubTab('streamer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'streamer'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>1. Streamer Auth (Broadcaster)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'bot'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>2. Bot Account Auth</span>
          </button>
          <button
            onClick={() => setActiveSubTab('apikeys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'apikeys'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>3. YouTube API JSON</span>
          </button>
        </div>

        {/* Tab 1: Streamer Auth */}
        {activeSubTab === 'streamer' && (
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-400" />
                  Streamer Channel Live Listener:
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                    streamMetadata.streamerAuth.authenticated
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {streamMetadata.streamerAuth.authenticated ? '● Connected & Listening' : '○ Disconnected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your YouTube channel to automatically stream-poll chat messages, synchronize your live thumbnail, and detect broadcast titles.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Streamer Channel Handle or ID:
              </label>
              <input
                type="text"
                value={streamerChannelInput}
                onChange={(e) => setStreamerChannelInput(e.target.value)}
                placeholder="e.g. @MyChannel or UC_xxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={handleToggleStreamerAuth}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  streamMetadata.streamerAuth.authenticated
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/70'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {streamMetadata.streamerAuth.authenticated ? 'Disconnect Streamer Account' : 'Authenticate Streamer Account'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Bot Account Auth */}
        {activeSubTab === 'bot' && (
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  Dedicated YouTube Bot Account:
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    streamMetadata.botAuth.authenticated
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {streamMetadata.botAuth.authenticated
                    ? '● Dedicated Account Active'
                    : `● In-App Fallback: [${botIdentity.botName}]`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If you have a separate YouTube account for your bot (e.g. <em>@{botIdentity.botName}</em>), connect it here.
                <strong className="text-slate-200"> If not available</strong>, DroidOS will automatically send responses in chat using your default in-app bot name or broadcaster credentials!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bot Account Email or Handle:
              </label>
              <input
                type="text"
                value={botAccountInput}
                onChange={(e) => setBotAccountInput(e.target.value)}
                placeholder={`e.g. ${botIdentity.botName.toLowerCase()}@gmail.com`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={handleToggleBotAuth}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  streamMetadata.botAuth.authenticated
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/70'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                {streamMetadata.botAuth.authenticated
                  ? 'Revert to In-App Default Bot Name'
                  : 'Link Dedicated Bot Account'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: API Keys */}
        {activeSubTab === 'apikeys' && (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>YouTube Data API v3 Auto-Found & Included</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                DroidOS automatically includes and provisions YouTube Data API v3 endpoints when you log in with your Google/YouTube account. You do <strong>not</strong> need to create or upload random client secret files manually!
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Low Resource Eco-Mode</div>
                  <div className="text-[10px] text-slate-400">Minimizes background CPU, GPU, and RAM consumption</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ecoMode}
                onChange={(e) => setEcoMode(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
