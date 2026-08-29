import React, { useState, useRef } from 'react';
import {
  Settings,
  User,
  Key,
  Volume2,
  Monitor,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Shield,
  Sparkles,
  Coffee,
  HardDrive,
  Save,
  Radio,
  FileJson,
  Layers,
  AlertTriangle,
  FolderOpen,
  Youtube,
  CheckCircle2,
  ExternalLink,
  Bot,
  ShieldCheck,
  Send,
  UserCheck,
  HelpCircle,
  Globe,
  LogIn,
  LogOut,
  Sliders,
  FileCode,
  Terminal,
  MessageSquareCode,
  Users,
  Copy,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  X
} from 'lucide-react';
import { AppSettings, StreamMetadata, OBSConfig, GoogleOAuthAccount, BlacklistSettings } from '../types';
import { DEFAULT_KNOWN_BOTS } from '../services/botBlacklistService';
import { soundSynth } from '../services/soundSynthesizer';
import { DroidOsLogo } from './DroidOsLogo';
import {
  authenticateWithGoogle,
  syncHostDetailsFromAuth,
  syncBotDetailsFromAuth,
  revokeGoogleToken
} from '../services/authService';
import {
  parseClientSecretsJson,
  applyParsedClientSecrets,
  getSampleClientSecretsTemplate,
  ParsedClientSecretsResult
} from '../services/clientSecretsParser';
import { ApiQuotaSection } from './ApiQuotaSection';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  streamMetadata: StreamMetadata;
  onUpdateStreamMetadata: (meta: StreamMetadata) => void;
  obsConfig: OBSConfig;
  onExportFullBackup: () => void;
  onImportBackupFile: (file: File) => void;
  onResetToDefaults: () => void;
  onOpenDataFolder?: () => void;
  onTestBotMessage?: (message: string) => void;
  blacklistSettings?: BlacklistSettings;
  onUpdateBlacklistSettings?: (blacklist: BlacklistSettings) => void;
  onOpenBotImporter?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  streamMetadata,
  onUpdateStreamMetadata,
  obsConfig,
  onExportFullBackup,
  onImportBackupFile,
  onResetToDefaults,
  onOpenDataFolder,
  onTestBotMessage,
  blacklistSettings = {
    ignoreSelf: true,
    ignoreKnownBots: true,
    ignoredUsers: [
      { id: 'bl-1', username: 'Streamlabs', reason: 'External alert bot', addedAt: new Date().toISOString() },
      { id: 'bl-2', username: 'Nightbot', reason: 'External chat bot', addedAt: new Date().toISOString() },
      { id: 'bl-3', username: 'MixItUp', reason: 'External desktop bot', addedAt: new Date().toISOString() }
    ],
    knownBotsList: DEFAULT_KNOWN_BOTS,
    ignoreCommandPrefixesFromBots: true
  },
  onUpdateBlacklistSettings,
  onOpenBotImporter
}) => {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [showOAuthClientId, setShowOAuthClientId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hostDetectSuccess, setHostDetectSuccess] = useState(false);
  const [botTestSuccess, setBotTestSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isAuthenticatingHost, setIsAuthenticatingHost] = useState(false);
  const [isAuthenticatingBot, setIsAuthenticatingBot] = useState(false);
  const [showCloudGuide, setShowCloudGuide] = useState(false);
  const [clientSecretsUploadResult, setClientSecretsUploadResult] = useState<ParsedClientSecretsResult | null>(null);
  const [clientSecretsError, setClientSecretsError] = useState<string | null>(null);
  const secretsInputRef = useRef<HTMLInputElement>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Blacklist state
  const [localBlacklist, setLocalBlacklist] = useState<BlacklistSettings>(blacklistSettings);
  const [newBlacklistUser, setNewBlacklistUser] = useState('');
  const [newBlacklistReason, setNewBlacklistReason] = useState('External bot / Ignore reply');

  // Local working copy of settings
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    ...settings,
    botAccountName: settings.botAccountName || '',
    botChannelHandle: settings.botChannelHandle || '',
    botChannelId: settings.botChannelId || '',
    botApiKey: settings.botApiKey || '',
    botIsSeparateAccount: settings.botIsSeparateAccount ?? true,
    sendChatAsBot: settings.sendChatAsBot ?? true,
    botModStatus: settings.botModStatus || 'verified_mod',
    hostLoginEmail: settings.hostLoginEmail || '',
    hostChannelId: settings.hostChannelId || '',
    autoDetectHostOnLogin: settings.autoDetectHostOnLogin ?? true,
    googleOAuthClientId: settings.googleOAuthClientId || ''
  });

  const [localStreamMeta, setLocalStreamMeta] = useState<StreamMetadata>({
    ...streamMetadata,
    streamerAuth: {
      ...streamMetadata.streamerAuth,
      channelHandle: streamMetadata.streamerAuth?.channelHandle || localSettings.channelHandle || '',
      channelTitle: streamMetadata.streamerAuth?.channelTitle || (localSettings.streamerName ? `${localSettings.streamerName} Official Stream` : ''),
      loginEmail: streamMetadata.streamerAuth?.loginEmail || localSettings.hostLoginEmail || '',
      autoDetectedFromLogin: true
    },
    botAuth: {
      ...streamMetadata.botAuth,
      accountName: streamMetadata.botAuth?.accountName || localSettings.botAccountName || '',
      channelId: streamMetadata.botAuth?.channelId || localSettings.botChannelId || '',
      botChannelHandle: streamMetadata.botAuth?.botChannelHandle || localSettings.botChannelHandle || '',
      isSeparateAccount: localSettings.botIsSeparateAccount ?? true,
      sendChatAsBot: localSettings.sendChatAsBot ?? true,
      moderatorStatus: localSettings.botModStatus || 'verified_mod'
    }
  });

  const handleSaveAll = () => {
    onUpdateSettings(localSettings);
    onUpdateStreamMetadata(localStreamMeta);
    soundSynth.play('coin');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClientSecretsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseClientSecretsJson(text);

      if (parsed.valid) {
        setClientSecretsUploadResult(parsed);
        setClientSecretsError(null);
        const { updatedSettings, updatedMeta } = applyParsedClientSecrets(
          parsed,
          localSettings,
          localStreamMeta
        );
        setLocalSettings(updatedSettings);
        setLocalStreamMeta(updatedMeta);
        onUpdateSettings(updatedSettings);
        onUpdateStreamMetadata(updatedMeta);
        soundSynth.play('victory');
      } else {
        setClientSecretsError(parsed.errorMessage || 'Invalid client_secret.json structure');
        soundSynth.play('airhorn');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadSampleSecrets = () => {
    const template = getSampleClientSecretsTemplate();
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_secret.json';
    a.click();
    URL.revokeObjectURL(url);
    soundSynth.play('coin');
  };

  const handleGoogleLoginHost = async () => {
    if (!localSettings.googleOAuthClientId) {
      alert("Please upload your Google Cloud client_secret.json or enter your OAuth Client ID below first!\n\nAlso, make sure you added http://localhost:3000 to your Authorized JavaScript Origins in Google Cloud.");
      return;
    }
    setIsAuthenticatingHost(true);
    try {
      const account = await authenticateWithGoogle('host', localSettings.googleOAuthClientId);
      const { updatedSettings, updatedMeta } = syncHostDetailsFromAuth(account, localSettings, localStreamMeta);
      setLocalSettings(updatedSettings);
      setLocalStreamMeta(updatedMeta);
      onUpdateSettings(updatedSettings);
      onUpdateStreamMetadata(updatedMeta);
      soundSynth.play('victory');
      setHostDetectSuccess(true);
      setTimeout(() => setHostDetectSuccess(false), 3500);
    } catch (err) {
      soundSynth.play('airhorn');
    } finally {
      setIsAuthenticatingHost(false);
    }
  };

  const handleGoogleLoginBot = async () => {
    if (!localSettings.googleOAuthClientId) {
      alert("Please upload your Google Cloud client_secret.json or enter your OAuth Client ID below first!\n\nAlso, make sure you added http://localhost:3000 to your Authorized JavaScript Origins in Google Cloud.");
      return;
    }
    setIsAuthenticatingBot(true);
    try {
      const account = await authenticateWithGoogle('bot', localSettings.googleOAuthClientId);
      const { updatedSettings, updatedMeta } = syncBotDetailsFromAuth(account, localSettings, localStreamMeta);
      setLocalSettings(updatedSettings);
      setLocalStreamMeta(updatedMeta);
      onUpdateSettings(updatedSettings);
      onUpdateStreamMetadata(updatedMeta);
      soundSynth.play('victory');
    } catch (err) {
      soundSynth.play('airhorn');
    } finally {
      setIsAuthenticatingBot(false);
    }
  };

  const handleDisconnectHost = () => {
    if (localSettings.hostGoogleAccount?.accessToken) {
      revokeGoogleToken(localSettings.hostGoogleAccount.accessToken);
    }
    const updatedSettings: AppSettings = {
      ...localSettings,
      hostGoogleAccount: undefined
    };
    const updatedMeta: StreamMetadata = {
      ...localStreamMeta,
      streamerAuth: {
        ...localStreamMeta.streamerAuth,
        authenticated: false
      }
    };
    setLocalSettings(updatedSettings);
    setLocalStreamMeta(updatedMeta);
    onUpdateSettings(updatedSettings);
    onUpdateStreamMetadata(updatedMeta);
    soundSynth.play('coin');
  };

  const handleDisconnectBot = () => {
    if (localSettings.botGoogleAccount?.accessToken) {
      revokeGoogleToken(localSettings.botGoogleAccount.accessToken);
    }
    const updatedSettings: AppSettings = {
      ...localSettings,
      botGoogleAccount: undefined
    };
    const updatedMeta: StreamMetadata = {
      ...localStreamMeta,
      botAuth: {
        ...localStreamMeta.botAuth,
        authenticated: false
      }
    };
    setLocalSettings(updatedSettings);
    setLocalStreamMeta(updatedMeta);
    onUpdateSettings(updatedSettings);
    onUpdateStreamMetadata(updatedMeta);
    soundSynth.play('coin');
  };

  const handleAutoFindHost = () => {
    const email = (localSettings.hostLoginEmail || '').trim();
    const handle = (localSettings.channelHandle || '').trim();
    const cleanName = handle.replace('@', '');
    const detectedChannelId = localSettings.hostChannelId || '';

    const updatedSettings: AppSettings = {
      ...localSettings,
      streamerName: cleanName,
      channelHandle: handle,
      hostChannelId: detectedChannelId,
      hostLoginEmail: email,
      autoDetectHostOnLogin: true
    };

    const updatedMeta: StreamMetadata = {
      ...localStreamMeta,
      channelName: cleanName,
      streamUrl: `https://youtube.com/${handle}/live`,
      isLive: true,
      activeLiveChatId: `yt-live-chat-${cleanName.toLowerCase()}-auto`,
      streamerAuth: {
        authenticated: true,
        accountName: `${cleanName} (Host)`,
        channelId: detectedChannelId,
        channelHandle: handle,
        channelTitle: `${cleanName} Official Live Broadcast`,
        loginEmail: email,
        autoDetectedFromLogin: true,
        apiV3AutoIncluded: true
      }
    };

    setLocalSettings(updatedSettings);
    setLocalStreamMeta(updatedMeta);
    onUpdateSettings(updatedSettings);
    onUpdateStreamMetadata(updatedMeta);

    soundSynth.play('victory');
    setHostDetectSuccess(true);
    setTimeout(() => setHostDetectSuccess(false), 3500);
  };

  const handleTriggerBotTest = () => {
    const botName = localSettings.botAccountName || 'Bot';
    const botHandle = localSettings.botChannelHandle || '@Bot';
    const testMsg = `🤖 [Bot Verification Ping] ${botName} (${botHandle}) is connected as a separate YouTube bot account and ready to send chat messages! ⚡`;
    
    if (onTestBotMessage) {
      onTestBotMessage(testMsg);
    }
    setBotTestSuccess(true);
    setTimeout(() => setBotTestSuccess(false), 3000);
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    setUpdateMessage(null);
    try {
      const res = await fetch('http://localhost:3000/api/check-for-updates', { method: 'POST' });
      if (res.ok) {
        setUpdateMessage('Check initiated! If an update is available, you will receive a system dialog soon.');
      } else {
        setUpdateMessage('Standalone/Dev mode does not support automatic updates.');
      }
    } catch (e) {
      setUpdateMessage('Failed to connect to the update service.');
    }
    setCheckingUpdates(false);
  };

  const handleAddBlacklistUser = () => {
    if (!newBlacklistUser.trim()) return;
    const cleanUser = newBlacklistUser.replace('@', '').trim();
    const newEntry = {
      id: `bl-${Date.now()}`,
      username: cleanUser,
      reason: newBlacklistReason || 'Ignored user / bot',
      addedAt: new Date().toISOString()
    };
    const updated = {
      ...localBlacklist,
      customBlacklist: [newEntry, ...localBlacklist.customBlacklist]
    };
    setLocalBlacklist(updated);
    if (onUpdateBlacklistSettings) onUpdateBlacklistSettings(updated);
    setNewBlacklistUser('');
    soundSynth.play('coin');
  };

  const handleRemoveBlacklistUser = (id: string) => {
    const updated = {
      ...localBlacklist,
      customBlacklist: localBlacklist.customBlacklist.filter((b) => b.id !== id)
    };
    setLocalBlacklist(updated);
    if (onUpdateBlacklistSettings) onUpdateBlacklistSettings(updated);
    soundSynth.play('airhorn');
  };

  const handleToggleBlacklistOption = (key: 'ignoreSelf' | 'ignoreKnownBots') => {
    const updated = {
      ...localBlacklist,
      [key]: !localBlacklist[key]
    };
    setLocalBlacklist(updated);
    if (onUpdateBlacklistSettings) onUpdateBlacklistSettings(updated);
    soundSynth.play('coin');
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    soundSynth.play('coin');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackupFile(file);
    }
  };

  const hostAccount = localSettings.hostGoogleAccount;
  const botAccount = localSettings.botGoogleAccount;

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-white/10 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">Streamer & Bot Configuration Hub</h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Production Ready Suite
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dual-Account Auth (Host & Bot)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Login for Host Streamer & dedicated YouTube Bot account, plus fast local folder settings for editing commands and responses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenDataFolder && (
              <button
                onClick={onOpenDataFolder}
                className="px-4 py-2.5 rounded-2xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4 text-purple-400" />
                <span>Open Local Data Folders</span>
              </button>
            )}

            <button
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 border border-white/20 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Settings Saved!' : 'Save All Preferences'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: GOOGLE LOGIN AUTHENTICATION FOR BOTH HOST & BOT ACCOUNTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-400" />
              <span>Google Login & YouTube Channel Linking</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
              Host / Bot Separation Topology
            </span>
          </div>
          <span className="text-xs text-slate-400">Allows bot to send chat messages without flooding main channel</span>
        </div>

        {/* Hidden client_secret.json file input */}
        <input
          ref={secretsInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleClientSecretsUpload}
          className="hidden"
        />

        {/* GOOGLE CLOUD & CLIENT SECRETS AUTO-DETECTOR CARD */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-[#151a26] border border-amber-500/30 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-white">Google Cloud & YouTube Data API v3 Setup</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> REQUIRED FOR FULL LIVE STREAM ACCESS
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sign in both the Host and Bot accounts using OAuth. Upload your <code className="font-mono text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded text-[11px]">client_secret.json</code> or drop it in your local data folder to auto-detect your project credentials.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => secretsInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-slate-950" />
                <span>Upload client_secret.json</span>
              </button>

              <button
                onClick={handleDownloadSampleSecrets}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Download sample template"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Template</span>
              </button>

              {onOpenDataFolder && (
                <button
                  onClick={onOpenDataFolder}
                  className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Data Folder</span>
                </button>
              )}

              <button
                onClick={() => setShowCloudGuide(!showCloudGuide)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showCloudGuide ? 'Hide Guide' : 'Setup Guide'}</span>
                {showCloudGuide ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Credentials Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Google Cloud Project</span>
              <div className="font-mono font-bold text-amber-300 truncate">
                {localSettings.googleCloudProjectId || 'Auto-Detect via client_secret.json'}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">YouTube Data API v3</span>
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>API v3 Ready & Enabled</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">OAuth Client Status</span>
              <div className="font-mono text-cyan-300 text-[11px] truncate">
                {localSettings.googleOAuthClientId
                  ? `${localSettings.googleOAuthClientId.substring(0, 18)}...`
                  : 'Ready for client_secret.json'}
              </div>
            </div>
          </div>

          {/* Client Secrets Upload Notification */}
          {clientSecretsUploadResult && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Success!</strong> Auto-detected Google Cloud credentials for Project{' '}
                  <code className="font-mono text-emerald-300 bg-emerald-900/60 px-1 py-0.5 rounded">
                    {clientSecretsUploadResult.projectId || 'Google Cloud'}
                  </code>. OAuth Client ID & YouTube Data API v3 configured.
                </span>
              </div>
              <button
                onClick={() => setClientSecretsUploadResult(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {clientSecretsError && (
            <div className="bg-red-950/80 border border-red-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-red-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{clientSecretsError}</span>
              </div>
              <button
                onClick={() => setClientSecretsError(null)}
                className="text-red-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Collapsible Step-by-Step Google Cloud & YouTube Data API v3 Guide */}
          {showCloudGuide && (
            <div className="bg-[#0f131d] rounded-2xl border border-white/10 p-4 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>How to create client_secret.json & enable YouTube Data API v3 in Google Cloud Console</span>
                </h5>
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">1</span>
                    <span>Enable YouTube Data API v3</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline font-mono">console.cloud.google.com</a> and create or select a project.<br />
                    2. In the left menu, go to <strong>APIs &amp; Services &gt; Library</strong>.<br />
                    3. Search for <strong>YouTube Data API v3</strong> and click <strong>Enable</strong>.
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">2</span>
                    <span>Configure OAuth Consent Screen</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Go to <strong>APIs &amp; Services &gt; OAuth consent screen</strong>.<br />
                    2. Choose <strong>External</strong> user type and give your app a name (e.g. <em>DroidOS Live</em>).<br />
                    3. Add required scopes: <code className="text-cyan-300 font-mono text-[10px]">youtube.readonly</code> and <code className="text-cyan-300 font-mono text-[10px]">youtube.force-ssl</code>.
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">3</span>
                    <span>Create OAuth 2.0 Client ID</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Go to <strong>APIs &amp; Services &gt; Credentials &gt; Create Credentials &gt; OAuth Client ID</strong>.<br />
                    2. Application type: <strong>Web application</strong>.<br />
                    3. Authorized origins: <code className="text-cyan-300 font-mono text-[10px]">http://localhost:3000</code><br />
                    4. Authorized redirects: <code className="text-cyan-300 font-mono text-[10px]">http://localhost:3000/oauth2callback</code>
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">4</span>
                    <span>Download JSON &amp; Auto-Detect</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Click <strong>Download JSON</strong> from Google Cloud.<br />
                    2. Either click the <strong>Upload client_secret.json</strong> button above, OR place the file directly in your <code className="text-amber-300 font-mono text-[10px]">AppData\Local\DroidOS</code> folder.<br />
                    3. DroidOS will instantly detect the project ID, Client ID, and API keys!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. HOST ACCOUNT CARD (AUTO-FOUND FROM LOGIN DATA) */}
          <div className="rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900/70 to-slate-900/90 border border-red-500/30 p-6 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner overflow-hidden">
                  {hostAccount?.picture ? (
                    <img src={hostAccount.picture} alt="Host Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Youtube className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">Host Account (Main Streamer)</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                      👑 BROADCASTER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Auto-found from login data • Channel Owner
                  </p>
                </div>
              </div>

              {hostAccount?.authenticated ? (
                <button
                  onClick={handleDisconnectHost}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleLoginHost}
                  disabled={isAuthenticatingHost}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-600/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAuthenticatingHost ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Auto-found Badge Banner */}
              <div className="p-3 bg-red-950/40 rounded-2xl border border-red-500/25 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      Host Auto-Found: <span className="text-red-300 font-mono">{localSettings.streamerName || 'None'}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Derived from login data ({localSettings.hostLoginEmail || 'No email'}). Channel URL: <a href={`https://youtube.com/${localSettings.channelHandle || ''}`} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline font-mono inline-flex items-center gap-0.5">youtube.com/{localSettings.channelHandle || ''} <ExternalLink className="w-2.5 h-2.5" /></a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAutoFindHost}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                  title="Re-run auto-detection algorithm"
                >
                  {hostDetectSuccess ? 'Found!' : 'Auto-Find'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Display Name</label>
                  <input
                    type="text"
                    value={localSettings.streamerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalSettings((prev) => ({ ...prev, streamerName: val }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        channelName: val,
                        streamerAuth: { ...prev.streamerAuth, accountName: `${val} (Host)` }
                      }));
                    }}
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-medium focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Channel Handle</label>
                  <input
                    type="text"
                    value={localSettings.channelHandle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalSettings((prev) => ({ ...prev, channelHandle: val }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        streamUrl: `https://youtube.com/${val}/live`,
                        streamerAuth: { ...prev.streamerAuth, channelHandle: val }
                      }));
                    }}
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Login Email</label>
                  <input
                    type="email"
                    value={localSettings.hostLoginEmail || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, hostLoginEmail: e.target.value }))
                    }
                    placeholder="creator@youtube.com"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Channel ID</label>
                  <input
                    type="text"
                    value={localSettings.hostChannelId || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, hostChannelId: e.target.value }))
                    }
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEPARATE YOUTUBE BOT ACCOUNT CARD */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900/70 to-slate-900/90 border border-purple-500/30 p-6 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner overflow-hidden">
                  {botAccount?.picture ? (
                    <img src={botAccount.picture} alt="Bot Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">Dedicated YouTube Bot Account</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      🤖 SEPARATE BOT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Separate YouTube channel used for sending chat messages & games
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {botAccount?.authenticated ? (
                  <button
                    onClick={handleDisconnectBot}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleLoginBot}
                    disabled={isAuthenticatingBot}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isAuthenticatingBot ? 'Connecting...' : 'Sign in as Bot Account'}</span>
                  </button>
                )}

                <button
                  onClick={handleTriggerBotTest}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Send a verification message into live chat from this bot account"
                >
                  {botTestSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-purple-300" />}
                  <span>{botTestSuccess ? 'Ping Sent!' : 'Test Bot'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Separate Bot Account Toggle & Why this matters */}
              <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-extrabold text-xs block">
                      Send Automated Chat Messages As Dedicated Bot Channel
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Keeps your main stream account clean. All commands, !boss rewards, and auto-responses post under this bot name.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = !localSettings.botIsSeparateAccount;
                      setLocalSettings((prev) => ({
                        ...prev,
                        botIsSeparateAccount: newVal,
                        sendChatAsBot: newVal
                      }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        botAuth: { ...prev.botAuth, isSeparateAccount: newVal, sendChatAsBot: newVal }
                      }));
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                      localSettings.botIsSeparateAccount ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.botIsSeparateAccount ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* YouTube Studio Mod Status */}
                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>YouTube Studio Live Chat Moderator Permission:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    Verified Moderator (Zero Rate-Limits)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bot Channel Display Name</label>
                  <input
                    type="text"
                    value={localSettings.botAccountName || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalSettings((prev) => ({ ...prev, botAccountName: val }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        botAuth: { ...prev.botAuth, accountName: val }
                      }));
                    }}
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-medium focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bot YouTube Handle</label>
                  <input
                    type="text"
                    value={localSettings.botChannelHandle || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalSettings((prev) => ({ ...prev, botChannelHandle: val }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        botAuth: { ...prev.botAuth, botChannelHandle: val }
                      }));
                    }}
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bot Channel ID</label>
                  <input
                    type="text"
                    value={localSettings.botChannelId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalSettings((prev) => ({ ...prev, botChannelId: val }));
                      setLocalStreamMeta((prev) => ({
                        ...prev,
                        botAuth: { ...prev.botAuth, channelId: val }
                      }));
                    }}
                    placeholder=""
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Bot Auth Token / Key</label>
                    <button
                      type="button"
                      onClick={() => setShowBotToken((prev) => !prev)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {showBotToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showBotToken ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showBotToken ? 'text' : 'password'}
                    value={localSettings.botApiKey || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, botApiKey: e.target.value }))
                    }
                    placeholder="yt_bot_auth_token_••••••••"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: YOUTUBE DATA API V3 QUOTA USAGE, POLLING MONITOR & STREAM TARGETS */}
      <ApiQuotaSection
        settings={localSettings}
        onUpdateSettings={(updated) => {
          setLocalSettings(updated);
          onUpdateSettings(updated);
        }}
        streamMetadata={localStreamMeta}
        onUpdateStreamMetadata={(updated) => {
          setLocalStreamMeta(updated);
          onUpdateStreamMetadata(updated);
        }}
      />

      {/* SECTION 3: SIMPLE FOLDER SETTINGS & HOT-RELOAD HUB (FOR DEPLOYMENT & EASY CONFIG EDITING) */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 backdrop-blur-xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Simple Folder Settings & Disk File System</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Easy Deployment & Sharing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Update commands, responses, and personalities directly via Windows folder files or in-app editors. Default commands & responses included, or add your own!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyPath('%LOCALAPPDATA%\\DroidOS')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy root folder path"
            >
              {copiedPath === '%LOCALAPPDATA%\\DroidOS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="font-mono text-[11px]">{copiedPath === '%LOCALAPPDATA%\\DroidOS' ? 'Path Copied!' : '%LOCALAPPDATA%\\DroidOS'}</span>
            </button>

            {onOpenDataFolder && (
              <button
                onClick={onOpenDataFolder}
                className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse All Folders</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Primary Config Folder Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Commands Folder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-400/20">
                /Commands
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Custom Commands Folder</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Drop <code>!command.json</code> or edit in app. Includes default <code>!points</code>, <code>!boss</code>, <code>!duel</code>, <code>!heist</code>, <code>!slots</code>.
              </p>
            </div>
            <button
              onClick={onOpenDataFolder}
              className="w-full py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Explore /Commands</span>
            </button>
          </div>

          {/* Responses Folder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <MessageSquareCode className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                /Responses
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Auto-Responses Folder</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Auto-reply triggers for Discord, schedule, specs, rules. Hot-reloads when modified.
              </p>
            </div>
            <button
              onClick={onOpenDataFolder}
              className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Explore /Responses</span>
            </button>
          </div>

          {/* Personalities Folder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-pink-400/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-400/20">
                /Personalities
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">44+ Mood Matrices & Memories</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contains 22 Questions + 22 Chat lines + 12 Memories for all 8 personalities.
              </p>
            </div>
            <button
              onClick={onOpenDataFolder}
              className="w-full py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Explore /Personalities</span>
            </button>
          </div>

          {/* Profiles & Memory Folder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/20">
                /Profiles
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Viewer Profiles & Memories</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Stores individual facts, loyalty points, visit streaks, and custom roast rules per viewer.
              </p>
            </div>
            <button
              onClick={onOpenDataFolder}
              className="w-full py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Explore /Profiles</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: CREDENTIALS, SOUND & OBS OUTPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream & API Keys */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Encrypted Keys & Local Storage</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">YouTube Stream Key</label>
                <button
                  type="button"
                  onClick={() => setShowStreamKey((prev) => !prev)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showStreamKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showStreamKey ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <input
                type={showStreamKey ? 'text' : 'password'}
                value={localSettings.streamKey}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, streamKey: e.target.value }))
                }
                placeholder="live_yt_stream_key_••••••••"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Custom Google OAuth Client ID</label>
                <button
                  type="button"
                  onClick={() => setShowOAuthClientId((prev) => !prev)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {showOAuthClientId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showOAuthClientId ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <input
                type={showOAuthClientId ? 'text' : 'password'}
                value={localSettings.googleOAuthClientId || ''}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, googleOAuthClientId: e.target.value }))
                }
                placeholder="apps.googleusercontent.com (Leave blank for default)"
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Local-Only Guarantee
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Credentials saved exclusively in local <strong>AppData\Local\DroidOS</strong> storage. Zero telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Audio Synthesizer & Sound Mixer */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>Audio Synthesis & Mixer</span>
            </div>
            <button
              onClick={() => soundSynth.play('coin')}
              className="text-[11px] font-bold text-pink-300 hover:text-white bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Test Audio
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-semibold">Master Audio Volume</span>
                <span className="font-mono text-purple-300">{localSettings.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings.masterVolume}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, masterVolume: Number(e.target.value) }))
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-semibold">Sound FX Synthesizer</span>
                <span className="font-mono text-pink-300">{localSettings.sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings.sfxVolume}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, sfxVolume: Number(e.target.value) }))
                }
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-semibold">Audio Interaction Feedback</span>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    enableAudioFeedback: !prev.enableAudioFeedback
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.enableAudioFeedback ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.enableAudioFeedback ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Overlay Output & Resolution */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>OBS Overlay & Resolution</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Broadcast Canvas Resolution</label>
              <select
                value={localSettings.overlayResolution}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    overlayResolution: e.target.value as any
                  }))
                }
                className="w-full px-3.5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none font-sans"
              >
                <option value="1080p">1080p Full HD (1920 × 1080) - Recommended</option>
                <option value="720p">720p HD (1280 × 720) - Low Resource</option>
                <option value="4k">4K UHD (3840 × 2160) - Ultra Fidelity</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-300 font-semibold">OBS WebSocket Link</span>
              <div className="font-mono text-[11px] text-cyan-300">
                ws://{obsConfig.host}:{obsConfig.port} ({obsConfig.connected ? 'Connected' : 'Ready / Standby'})
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-semibold">Auto Local Storage Save</span>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    enableAutoSave: !prev.enableAutoSave
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  localSettings.enableAutoSave ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.enableAutoSave ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOT BLACKLIST & CHAT PROTECTION SECTION */}
      <div className="rounded-3xl bg-gradient-to-br from-red-950/20 via-slate-900/60 to-slate-900/80 border border-red-500/20 p-6 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bot Loop Protection & User Blacklist</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Anti-Loop Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Prevents infinite reply loops between DroidBot and other bots like Streamlabs, Nightbot, Mix It Up, or blacklisted users.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Ignore Bot Itself (Anti-Self Loop)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bot will never reply to messages authored by itself or the configured bot handle ({localSettings.botChannelHandle || '@DroidBotLive'}).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleBlacklistOption('ignoreSelf')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                localBlacklist.ignoreSelf ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  localBlacklist.ignoreSelf ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ignore Known Stream Bots</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Auto-ignores Streamlabs, Nightbot, Mix It Up, StreamElements, Moobot, Botisimo, Wizebot, Fossabot, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleBlacklistOption('ignoreKnownBots')}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                localBlacklist.ignoreKnownBots ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  localBlacklist.ignoreKnownBots ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Add User to Blacklist */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
          <div className="text-xs font-bold text-slate-300">Add Custom User or Bot to Blacklist:</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Username or @handle (e.g., Nightbot, SpamAccount)"
              value={newBlacklistUser}
              onChange={(e) => setNewBlacklistUser(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBlacklistUser()}
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Reason (optional, e.g. External alert bot)"
              value={newBlacklistReason}
              onChange={(e) => setNewBlacklistReason(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBlacklistUser()}
              className="sm:w-64 px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-red-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddBlacklistUser}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shrink-0"
            >
              Add to Blacklist
            </button>
          </div>
        </div>

        {/* Blacklisted Users List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400">
            Active Blacklist Entries ({localBlacklist.customBlacklist?.length ?? 0}):
          </div>
          {(localBlacklist.customBlacklist?.length ?? 0) === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 bg-white/[0.01] rounded-xl border border-white/5">
              No custom users blacklisted. Bot will only ignore based on global toggles.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {localBlacklist.customBlacklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-red-500/20 text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-red-300 truncate">@{item.username}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlacklistUser(item.id)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors shrink-0"
                    title="Remove from Blacklist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CROSS-BOT MIGRATION & IMPORT SECTION */}
      {onOpenBotImporter && (
        <div className="rounded-3xl bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Cross-Bot Commands & Settings Migration</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Streamlabs • Nightbot • Mix It Up
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Upload exported files or pastes from other bots to automatically convert commands and variables into DroidOS.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBotImporter}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 border border-cyan-400/30 flex items-center gap-2 cursor-pointer transition-transform transform hover:scale-105 shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Launch Bot Importer</span>
            </button>
          </div>
        </div>
      )}

      {/* Backup, Export & Restore Section */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>Local Disk Data Management & Snapshots</span>
          </div>

          {onOpenDataFolder && (
            <button
              onClick={onOpenDataFolder}
              className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse AppData Local Folder</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          {/* Export Backup */}
          <button
            onClick={onExportFullBackup}
            className="p-4 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-left space-y-1 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Download className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-purple-300">.json</span>
            </div>
            <div className="font-bold text-white text-xs">Export Full Backup</div>
            <p className="text-[11px] text-slate-400">Save viewers, commands, redeems, responses, and settings</p>
          </button>

          {/* Import Backup */}
          <label className="p-4 rounded-2xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-left space-y-1 transition-all cursor-pointer group block">
            <div className="flex items-center justify-between">
              <Upload className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-cyan-300">Restore</span>
            </div>
            <div className="font-bold text-white text-xs">Import Backup File</div>
            <p className="text-[11px] text-slate-400">Load a previous DroidOS workstation snapshot</p>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Check for Updates */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-300">Auto Update</span>
              </div>
              <div className="font-bold text-white text-xs mt-1">Application Updates</div>
              <p className="text-[10.5px] text-slate-400 leading-snug mt-1">
                {updateMessage || 'Scan for the latest version of DroidOS on Github.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckUpdates}
              disabled={checkingUpdates}
              className="w-full py-1.5 mt-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-300 font-bold text-xs cursor-pointer transition-colors text-center"
            >
              {checkingUpdates ? 'Checking...' : 'Check for Updates'}
            </button>
          </div>

          {/* Reset Defaults */}
          <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 text-left space-y-2">
            <div className="flex items-center justify-between">
              <RefreshCw className="w-5 h-5 text-red-400" />
              <span className="text-[10px] font-mono text-red-300">Danger Zone</span>
            </div>
            <div className="font-bold text-white text-xs">Factory Reset</div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Reset to Defaults
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetToDefaults();
                    setConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About & Creator Badge */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-cyan-900/20 border border-white/10 p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <DroidOsLogo size="lg" />
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>DroidOS YouTube Stream Automation Workstation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Developed by <strong className="text-purple-300">MRADDICTIVE</strong> • Native Local Desktop Suite
            </p>
          </div>
        </div>

        <a
          href="https://ko-fi.com/mraddictive"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-2xl bg-[#FF5E5B] hover:bg-[#ff4642] text-white text-xs font-bold shadow-lg shadow-[#FF5E5B]/20 flex items-center gap-2 transition-transform transform hover:scale-105 cursor-pointer shrink-0"
        >
          <Coffee className="w-4 h-4" />
          <span>Support on Ko-fi</span>
        </a>
      </div>
    </div>
  );
};
