import React from 'react';
import {
  Download,
  Tv,
  Bot,
  Radio,
  Minus,
  Square,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { DroidOsLogo } from './DroidOsLogo';
import { version } from '../../package.json';

interface WindowsTitlebarProps {
  onDownloadZip?: () => void;
  isDownloadingZip?: boolean;
  onOpenOverlayPreview?: () => void;
  onOpenDownloadTab?: () => void;
  onOpenDataFolder?: () => void;
  isLive: boolean;
  botPersonalityName?: string;
  streamTitle?: string;
  title?: string;
  obsConnected?: boolean;
  onDownloadClick?: () => void;
}

export const WindowsTitlebar: React.FC<WindowsTitlebarProps> = ({
  onDownloadZip,
  isDownloadingZip,
  onOpenOverlayPreview,
  onOpenDownloadTab,
  onOpenDataFolder,
  isLive,
  botPersonalityName = 'Friendly',
  streamTitle,
  title,
  obsConnected = false,
  onDownloadClick
}) => {
  const handleDownload = onDownloadClick || onOpenDownloadTab || onDownloadZip || (() => {});

  return (
    <header className="h-12 bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4 select-none z-50 sticky top-0 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Left: Window Brand & Status Indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <DroidOsLogo size="xs" />
          <span className="text-xs font-black tracking-wider text-white flex items-center gap-2">
            DROIDOS
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.06] text-purple-300 border border-white/10 backdrop-blur-md">
              v{version} WIN-x64
            </span>
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Live Badges */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 backdrop-blur-md shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 shadow-sm shadow-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-200">{isLive ? 'YT Live' : 'Offline'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <span className="text-[10px] text-slate-400">Bot:</span>
            <span className="font-semibold text-emerald-300 text-[10px]">{botPersonalityName}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 backdrop-blur-md shadow-sm">
            <span className={`w-2 h-2 rounded-full ${obsConnected ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-500'}`} />
            <span className="text-[10px] text-slate-400">OBS ws:</span>
            <span className="font-semibold text-cyan-300 text-[10px]">{obsConnected ? 'Connected (4455)' : 'Ready (4455)'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Title text */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate max-w-md">
        <span className="truncate">{streamTitle || title || 'YouTube Stream Automation Workstation'}</span>
      </div>

      {/* Right: Quick Action Controls + Windows Window Controls */}
      <div className="flex items-center gap-2">
        {onOpenDataFolder && (
          <button
            onClick={onOpenDataFolder}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-600/15 hover:bg-purple-600/30 border border-purple-500/30 backdrop-blur-md transition-all shadow-sm cursor-pointer"
            title="Open AppData Local Storage Folder Explorer"
          >
            <span className="text-xs">📁</span>
            <span className="hidden sm:inline text-[11px] font-bold">Data Folder</span>
          </button>
        )}

        {onOpenOverlayPreview && (
          <button
            onClick={onOpenOverlayPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 backdrop-blur-md transition-all shadow-sm cursor-pointer"
            title="Open OBS Overlay Browser Source Live Preview"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px]">OBS Overlay</span>
          </button>
        )}

      </div>
    </header>
  );
};

