import React, { useEffect, useState } from 'react';
import { Megaphone, ExternalLink, X, Sparkles, Video, CheckCircle2, User } from 'lucide-react';
import { ActiveShoutoutOverlay } from '../types';

interface ShoutoutOverlayWidgetProps {
  activeShoutout: ActiveShoutoutOverlay | null;
  onDismiss: () => void;
  isObsSourcePreview?: boolean;
}

export const ShoutoutOverlayWidget: React.FC<ShoutoutOverlayWidgetProps> = ({
  activeShoutout,
  onDismiss,
  isObsSourcePreview = false
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeShoutout) return;

    setProgress(100);
    const duration = activeShoutout.durationMs || 6000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [activeShoutout, onDismiss]);

  if (!activeShoutout) return null;

  // Theme styling mapping
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'neon-cyber':
        return {
          wrapper: 'bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45)] text-white',
          accent: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          progress: 'bg-gradient-to-r from-cyan-500 to-fuchsia-500',
          avatarRing: 'ring-4 ring-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
        };
      case 'gold-vip':
        return {
          wrapper: 'bg-amber-950/95 border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.4)] text-amber-50',
          accent: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          progress: 'bg-gradient-to-r from-amber-500 to-yellow-300',
          avatarRing: 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
        };
      case 'gradient-stream':
        return {
          wrapper: 'bg-gradient-to-br from-purple-950/95 via-slate-950/95 to-indigo-950/95 border-2 border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.4)] text-white',
          accent: 'text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
          progress: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500',
          avatarRing: 'ring-4 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]'
        };
      case 'glass-modern':
        return {
          wrapper: 'bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl text-slate-100',
          accent: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          progress: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          avatarRing: 'ring-3 ring-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
        };
      case 'minimal-card':
      default:
        return {
          wrapper: 'bg-slate-900 border border-slate-700 shadow-2xl text-slate-100',
          accent: 'text-blue-400',
          badge: 'bg-slate-800 text-slate-300 border-slate-600',
          progress: 'bg-blue-500',
          avatarRing: 'ring-2 ring-slate-400'
        };
    }
  };

  const themeStyle = getThemeClasses(activeShoutout.theme || 'neon-cyber');

  // Position mapping (for floating screen alerts)
  const getPositionClasses = (position: string) => {
    if (isObsSourcePreview) return 'relative';
    switch (position) {
      case 'top-left':
        return 'fixed top-6 left-6 z-50';
      case 'top-right':
        return 'fixed top-6 right-6 z-50';
      case 'center':
        return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50';
      case 'bottom-right':
        return 'fixed bottom-6 right-6 z-50';
      case 'bottom-left':
      default:
        return 'fixed bottom-6 left-6 z-50';
    }
  };

  return (
    <div
      id={`shoutout-overlay-${activeShoutout.id}`}
      className={`${getPositionClasses(activeShoutout.position)} max-w-lg w-full animate-in fade-in zoom-in-95 duration-300 pointer-events-auto`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-5 ${themeStyle.wrapper} backdrop-blur-md transition-all`}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-fuchsia-500/10 blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Video className="w-4 h-4" />
            </span>
            <span className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5 text-cyan-300">
              <Megaphone className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
              {activeShoutout.heading || 'COMMUNITY SHOUTOUT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${themeStyle.badge}`}>
              {activeShoutout.role}
            </span>
            {!isObsSourcePreview && (
              <button
                id="btn-dismiss-shoutout-overlay"
                onClick={onDismiss}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss Shoutout"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area with Avatar & Channel Info */}
        <div className="flex items-center gap-4">
          {/* YouTube Profile Picture Avatar */}
          <div className="relative flex-shrink-0">
            {activeShoutout.avatarUrl ? (
              <img
                src={activeShoutout.avatarUrl}
                alt={activeShoutout.username}
                referrerPolicy="no-referrer"
                className={`w-16 h-16 rounded-full object-cover ${themeStyle.avatarRing}`}
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-white bg-gradient-to-br ${activeShoutout.avatarColor || 'from-cyan-500 to-blue-600'} ${themeStyle.avatarRing}`}
              >
                {activeShoutout.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full text-[10px] shadow-lg">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-lg font-black tracking-tight text-white truncate">
                @{activeShoutout.username}
              </h3>
              {activeShoutout.displayName !== activeShoutout.username && (
                <span className="text-xs text-slate-400 truncate">
                  ({activeShoutout.displayName})
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {activeShoutout.customMessage || activeShoutout.subheading}
            </p>

            {/* YouTube Channel Link */}
            {activeShoutout.channelUrl && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-mono">
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate">{activeShoutout.channelUrl}</span>
              </div>
            )}
          </div>
        </div>

        {/* Remaining Time Progress Bar */}
        <div className="mt-4 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${themeStyle.progress} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
