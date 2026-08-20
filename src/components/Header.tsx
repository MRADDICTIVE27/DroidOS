import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Key,
  MessageSquare,
  Brain,
  MessageSquareCode,
  Users,
  BarChart3,
  Clock,
  Coins,
  Volume2,
  Trophy,
  Tv,
  Gift,
  Terminal,
  Activity,
  RefreshCw,
  Settings,
  Heart,
  Radio,
  Sparkles,
  Palette,
  Megaphone,
  Cloud
} from 'lucide-react';
import { BotIdentity, StreamLiveMetadata, AppTheme, AppReleaseInfo } from '../types';

export const ALL_WORKSPACE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'identity', label: 'Bot Identity', icon: Bot },
  { id: 'authenticator', label: 'Authenticator', icon: Key },
  { id: 'liveviewer', label: 'Chat', icon: MessageSquare },
  { id: 'shoutouts', label: 'Shoutouts & OBS', icon: Megaphone },
  { id: 'personalities', label: 'Response Styles', icon: Sparkles },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'roles', label: 'Responses', icon: MessageSquareCode },
  { id: 'profiles', label: 'Viewer Profiles', icon: Users },
  { id: 'cloudbackup', label: 'Cloud Backups', icon: Cloud },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'automations', label: 'Automations', icon: Clock },
  { id: 'points', label: 'Points', icon: Coins },
  { id: 'soundeffects', label: 'Sound Effects', icon: Volume2 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'games', label: 'Chat Games', icon: Radio },
  { id: 'obs', label: 'OBS Control', icon: Tv },
  { id: 'obs-overlay', label: 'OBS Overlay', icon: Tv },
  { id: 'redeems', label: 'Redeems', icon: Gift },
  { id: 'general', label: 'General Commands', icon: MessageSquareCode },
  { id: 'custom', label: 'Custom Commands', icon: Terminal },
  { id: 'telemetry', label: 'Logs', icon: Activity },
  { id: 'updates', label: 'Updates', icon: RefreshCw },
  { id: 'settings', label: 'Settings', icon: Settings }
];

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabOrder: string[];
  botIdentity: BotIdentity;
  setBotIdentity: React.Dispatch<React.SetStateAction<BotIdentity>>;
  streamMetadata: StreamLiveMetadata;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  uptimeSeconds: number;
  releaseInfo: AppReleaseInfo;
  theme: AppTheme;
  openConfig: () => void;
  openCleanSetup: () => void;
  openSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  tabOrder,
  botIdentity,
  setBotIdentity,
  streamMetadata,
  isListening,
  setIsListening,
  isLive,
  setIsLive,
  uptimeSeconds,
  releaseInfo,
  theme,
  openConfig,
  openCleanSetup,
  openSupport
}) => {
  const [showPinInput, setShowPinInput] = React.useState(false);
  const [pinValue, setPinValue] = React.useState('');
  const [pinError, setPinError] = React.useState(false);
  
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeft(scrollRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    scrollRef.current!.scrollLeft = scrollLeft - walk;
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  const handleUnlock = () => {
    if (pinValue === botIdentity.adminPin) {
      setBotIdentity(prev => ({ ...prev, isAdminLocked: false }));
      setShowPinInput(false);
      setPinValue('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleLock = () => {
    setBotIdentity(prev => ({ ...prev, isAdminLocked: true }));
    // If on an admin tab, switch to dashboard
    const adminTabs = ['identity', 'authenticator', 'shoutouts', 'memory', 'roles', 'cloudbackup', 'analytics', 'automations', 'obs', 'telemetry', 'updates', 'settings', 'games'];
    if (adminTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  // Map user custom tab order to tab objects
  const adminTabs = ['identity', 'authenticator', 'shoutouts', 'memory', 'roles', 'cloudbackup', 'analytics', 'automations', 'obs', 'telemetry', 'updates', 'settings', 'games'];
  
  const orderedTabs = tabOrder
    .map((id) => ALL_WORKSPACE_TABS.find((t) => t.id === id))
    .filter(Boolean)
    .filter(tab => {
      if (!botIdentity.isAdminLocked) return true;
      return !adminTabs.includes(tab!.id);
    }) as typeof ALL_WORKSPACE_TABS;

  return (
    <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">DroidOS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
                v{releaseInfo.currentVersion}
              </span>
              {releaseInfo.hasUpdate && (
                <button
                  onClick={() => setActiveTab('updates')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse cursor-pointer hover:bg-emerald-500/30"
                >
                  Update v{releaseInfo.latestVersion} Available!
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              YouTube Stream Chat & Economy Workstation
            </p>
          </div>
        </div>

        {/* Status Pills & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Broadcaster Stream Status */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
              isLive
                ? 'bg-rose-950/60 border-rose-600/50 text-rose-300 hover:bg-rose-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
            <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
            {isLive && <span className="font-mono text-[11px] text-rose-400 ml-1">({formatTime(uptimeSeconds)})</span>}
          </button>

          {/* Bot Dispatch Status */}
          <button
            onClick={() => setIsListening(!isListening)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
              isListening
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isListening ? `Bot [${botIdentity.botName}] Active` : 'Bot Paused'}</span>
          </button>

          {/* Support Creator Button */}
          <button
            onClick={openSupport}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20 transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Support MRADDICTIVE</span>
          </button>

          {/* Quick Setup Modal */}
          <button
            onClick={openCleanSetup}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Setup Wizard</span>
          </button>

          {/* Admin Lock Toggle */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {botIdentity.isAdminLocked ? (
              <div className="flex items-center gap-2">
                {showPinInput ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinValue}
                      onChange={(e) => setPinValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                      placeholder="PIN"
                      className={`w-16 bg-slate-950 border ${pinError ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500`}
                      autoFocus
                    />
                    <button
                      onClick={handleUnlock}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowPinInput(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPinInput(true)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors group flex items-center gap-2"
                    title="Unlock Admin Controls"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Admin Lock</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleLock}
                className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30 cursor-pointer transition-all flex items-center gap-2"
                title="Lock Admin Controls"
              >
                <Key className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Unlocked</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 text-xs cursor-grab active:cursor-grabbing"
      >
        {orderedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'updates' && releaseInfo.hasUpdate && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
