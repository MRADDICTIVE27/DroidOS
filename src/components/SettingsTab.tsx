import React, { useState } from 'react';
import {
  Palette,
  LayoutGrid,
  Download,
  Upload,
  RotateCcw,
  Check,
  Sparkles,
  ShieldCheck,
  Volume2,
  Sliders,
  Moon,
  Sun,
  Speaker,
  Activity
} from 'lucide-react';
import { AppTheme, BotIdentity } from '../types';

interface SettingsTabProps {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  botIdentity: BotIdentity;
  setBotIdentity: React.Dispatch<React.SetStateAction<BotIdentity>>;
  tabOrder: string[];
  setTabOrder: (tabs: string[]) => void;
  availableTabs: { id: string; label: string; icon: any }[];
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetFactory: () => void;
  onSaveNotice: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  setTheme,
  botIdentity,
  setBotIdentity,
  tabOrder,
  setTabOrder,
  availableTabs,
  onExportBackup,
  onImportBackup,
  onResetFactory,
  onSaveNotice
}) => {
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  React.useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(outputs);
      } catch (e) {
        console.warn('[DroidOS Audio] Could not enumerate devices:', e);
      }
    };
    getDevices();
  }, []);

  const themes: { id: AppTheme; name: string; desc: string; preview: string }[] = [
    {
      id: 'dark',
      name: 'Obsidian Dark (Default)',
      desc: 'Sleek, eye-safe midnight slate palette with blue accents',
      preview: 'bg-slate-950 border-slate-800 text-blue-400'
    },
    {
      id: 'light',
      name: 'Pure Clean Light',
      desc: 'Bright, crisp modern daylight theme with high contrast',
      preview: 'bg-slate-100 border-slate-300 text-blue-600'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      desc: 'High-energy futuristic violet, cyan, and hot-pink glow',
      preview: 'bg-zinc-950 border-pink-500/40 text-pink-400'
    },
    {
      id: 'emerald',
      name: 'Emerald Matrix',
      desc: 'Clean bio-tech deep forest green and glowing mint tones',
      preview: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      desc: 'Regal violet and amethyst palette for luxury streamers',
      preview: 'bg-purple-950/40 border-purple-500/40 text-purple-400'
    },
    {
      id: 'sunset',
      name: 'Sunset Horizon',
      desc: 'Warm amber, crimson, and golden hour radiant gradient',
      preview: 'bg-stone-950 border-amber-500/40 text-amber-400'
    }
  ];

  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tabOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setTabOrder(newOrder);
    onSaveNotice();
  };

  const handleApplyImport = () => {
    if (!importText.trim()) return;
    onImportBackup(importText.trim());
    setImportText('');
    setShowImportArea(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">System Settings & Theme Customization</h2>
            <p className="text-xs text-slate-400">
              Customize visual color schemes, re-order application tabs, and manage JSON backups
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Themes Chooser (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Theme Palette Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Theme & Visual Atmosphere</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    onSaveNotice();
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    theme === t.id
                      ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-500'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t.name}</span>
                    {theme === t.id && (
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{t.desc}</p>
                  <div className={`w-full h-4 rounded-lg border ${t.preview}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Audio Output Settings */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Speaker className="w-4 h-4 text-emerald-400" />
              <span>Audio Routing & Output Engine</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Primary Audio Output Device</label>
                <div className="relative group">
                  <select
                    value={botIdentity.audioDeviceId || ''}
                    onChange={(e) => {
                      setBotIdentity(prev => ({ ...prev, audioDeviceId: e.target.value }));
                      onSaveNotice();
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="">Default System Output</option>
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Audio Output ${device.deviceId.substring(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 group-hover:text-emerald-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed italic">
                  Note: Audio device routing (setSinkId) is a browser-restricted feature. If the selected device doesn't respond, ensure the application has permissions or check your system sound settings.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[10px] text-slate-400">
                  Audio queuing is automatically managed. Redeems will play sequentially to prevent overlapping noise.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Access Control */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Security & Access Control</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Admin Access PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={botIdentity.adminPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setBotIdentity(prev => ({ ...prev, adminPin: val }));
                    onSaveNotice();
                  }}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 italic">Set a 4-digit PIN to lock sensitive tabs when sharing the app URL.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Admin Lock State</label>
                <button
                  onClick={() => {
                    setBotIdentity(prev => ({ ...prev, isAdminLocked: !prev.isAdminLocked }));
                    onSaveNotice();
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    botIdentity.isAdminLocked
                      ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {botIdentity.isAdminLocked ? 'Admin Lock Enabled' : 'Admin Lock Disabled'}
                </button>
                <p className="text-[10px] text-slate-500 italic">Toggle to enable or disable the admin lock.</p>
              </div>

              <div className="flex flex-col justify-end">
                <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>Tip:</strong> Use the Lock icon in the top header to hide administrative tabs like Games, Settings, and Bot Identity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Configuration Backup & Data Portability</span>
            </h3>

            <p className="text-slate-300 leading-relaxed">
              Export your entire DroidOS setup (custom commands, viewer points, achievements, bot identity, and roles) into a single encrypted JSON file.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={onExportBackup}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Export Configuration JSON</span>
              </button>

              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-2 cursor-pointer border border-slate-700"
              >
                <Upload className="w-4 h-4" />
                <span>Import Backup</span>
              </button>

              <button
                onClick={onResetFactory}
                className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Factory Reset</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your local browser storage? This will reset all your settings!')) {
                    localStorage.removeItem('droidos_state');
                    window.location.reload();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 border border-slate-700 text-slate-400 hover:text-rose-300 font-semibold flex items-center gap-2 cursor-pointer ml-auto"
              >
                <Activity className="w-4 h-4" />
                <span>Clear Browser Cache</span>
              </button>
            </div>

            {showImportArea && (
              <div className="pt-3 space-y-2">
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste JSON configuration payload here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                />
                <button
                  onClick={handleApplyImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Apply & Restore Backup
                </button>
              </div>
            )}
          </div>

          {/* Desktop App Installation Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Desktop App Mode (PWA)</span>
            </h3>

            <div className="flex items-start gap-3 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-slate-200 font-bold">Install DroidOS as a Desktop App</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  You can run DroidOS as a standalone application on your PC without the browser address bar. 
                  This makes it feel like a real app and allows you to pin it to your taskbar.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">1</div>
                <p>Open the <strong>Shared App URL</strong> in Chrome or Edge.</p>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">2</div>
                <p>Click the <strong className="text-emerald-400">Install App</strong> icon in the address bar (right side).</p>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">3</div>
                <p>Once installed, right-click the desktop icon to <strong className="text-blue-400">Pin to Taskbar</strong>.</p>
              </div>
            </div>
            
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <p className="text-[9px] text-slate-500 italic">
                DroidOS remains synced across sessions. Closing the "app" window will not lose your points or configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Tab Order Re-ordering (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                Workspace Tab Order
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Reorder with ↑ / ↓</span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[480px] scrollbar-thin">
            {tabOrder.map((tabId, idx) => {
              const tabMeta = availableTabs.find((t) => t.id === tabId);
              if (!tabMeta) return null;
              const Icon = tabMeta.icon;

              return (
                <div
                  key={tabId}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}</span>
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-slate-200">{tabMeta.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveTab(idx, 'up')}
                      className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 cursor-pointer text-xs"
                    >
                      ↑
                    </button>
                    <button
                      disabled={idx === tabOrder.length - 1}
                      onClick={() => moveTab(idx, 'down')}
                      className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 cursor-pointer text-xs"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
