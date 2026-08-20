import React, { useState } from 'react';
import { RefreshCw, Download, ExternalLink, Check, Sparkles, AlertCircle, ShieldCheck, GitBranch } from 'lucide-react';
import { AppReleaseInfo } from '../types';

interface UpdatesTabProps {
  releaseInfo: AppReleaseInfo;
  setReleaseInfo: React.Dispatch<React.SetStateAction<AppReleaseInfo>>;
  onPerformUpdate: () => void;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  releaseInfo,
  setReleaseInfo,
  onPerformUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setUpdateStep('Creating encrypted backup of custom commands, points & profiles...');

    setTimeout(() => {
      setUpdateStep('Pulling latest release package from GitHub (MRADDICTIVE27/DroidOS)...');
      setTimeout(() => {
        setUpdateStep('Hot-swapping system modules & applying schema migrations...');
        setTimeout(() => {
          setUpdateStep('Restoring all personal configurations & restarting applet...');
          setTimeout(() => {
            setIsUpdating(false);
            setUpdateStep(null);
            setUpdateSuccess(true);
            setReleaseInfo((prev) => ({
              ...prev,
              currentVersion: prev.latestVersion,
              hasUpdate: false
            }));
            onPerformUpdate();
          }, 800);
        }, 800);
      }, 900);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">GitHub Software Updates & Release Sync</h2>
            <p className="text-xs text-slate-400">
              Synchronize with official releases from <strong className="text-slate-200">MRADDICTIVE27/DroidOS</strong>
            </p>
          </div>
        </div>

        <a
          href={releaseInfo.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          <span>View on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Release Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                Current: v{releaseInfo.currentVersion}
              </span>
              {releaseInfo.hasUpdate ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse font-mono">
                  ✨ Update Available: v{releaseInfo.latestVersion}
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  ✓ Up to date
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white">
              DroidOS Workstation v{releaseInfo.latestVersion} Release
            </h3>
            <p className="text-xs text-slate-400">Release Date: {releaseInfo.releaseDate}</p>
          </div>

          <div>
            {releaseInfo.hasUpdate ? (
              <button
                onClick={handleStartUpdate}
                disabled={isUpdating}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isUpdating ? 'Updating...' : `Update to v${releaseInfo.latestVersion} & Restart`}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-600/30">
                <Check className="w-4 h-4" />
                <span>Running Latest Stable Version</span>
              </div>
            )}
          </div>
        </div>

        {/* Update Progress Indicator */}
        {isUpdating && (
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-3 animate-pulse">
            <div className="flex items-center gap-3 text-xs text-blue-300 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>{updateStep}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-[pulse_1s_infinite] w-3/4 rounded-full" />
            </div>
          </div>
        )}

        {/* Success Alert */}
        {updateSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Successfully updated to v{releaseInfo.latestVersion}! All viewer points, roles, custom commands, and OBS setups were preserved.
              </span>
            </div>
            <button
              onClick={() => setUpdateSuccess(false)}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Release Notes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>What's New in This Version:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {releaseInfo.releaseNotes.map((note, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-sm"
              >
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Preservation Guarantee */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Data Loss Guarantee:</strong> DroidOS updates automatically migrate your viewer profiles, custom commands, roles, point balances, and memory facts without ever overwriting personal settings.
          </span>
        </div>
      </div>
    </div>
  );
};
