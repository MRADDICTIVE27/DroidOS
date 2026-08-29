import React, { useState, useRef } from 'react';
import {
  Coins,
  Gift,
  Award,
  TrendingUp,
  Sparkles,
  Search,
  Plus,
  Minus,
  Sliders,
  DollarSign,
  Save,
  Check,
  Image as ImageIcon,
  Upload,
  Layers,
  Eye,
  Info,
  Terminal,
  Trash2
} from 'lucide-react';
import { EconomySettings, ViewerProfile, MassDropPreset } from '../types';
import { soundSynth } from '../services/soundSynthesizer';

interface PointsEconomyTabProps {
  economy: EconomySettings;
  onUpdateEconomy: (settings: EconomySettings) => void;
  viewers: ViewerProfile[];
  onAdjustPoints: (username: string, delta: number) => void;
  onMassAirdrop: (amount: number) => void;
  onTriggerPreview?: (preset: MassDropPreset, customUrl?: string, count?: number) => void;
  onResetAllPoints?: () => void;
}

const PRESET_OPTIONS: Array<{ id: MassDropPreset; label: string; icon: string; description: string }> = [
  { id: 'coins', label: 'Gold Coins', icon: '🪙', description: 'Classic gold coins & treasures falling from top' },
  { id: 'cookies', label: 'Cookie Rain', icon: '🍪', description: 'Delicious cookies raining over stream' },
  { id: 'bills', label: 'Dollar Bills', icon: '💵', description: 'Make it rain cash bills & money' },
  { id: 'cats', label: 'Cats & Kittens', icon: '🐱', description: 'Adorable kittens, paws, and feline joy' },
  { id: 'dogs', label: 'Puppy Avalanche', icon: '🐶', description: 'Cute puppies & dogs cascading down' },
  { id: 'gems', label: 'Diamonds & Gems', icon: '💎', description: 'Sparkling diamond crystals & jewels' },
  { id: 'tacos', label: 'Taco Fiesta', icon: '🌮', description: 'Tasty tacos, burritos, and spicy fun' },
  { id: 'stars', label: 'Stardust & Stars', icon: '⭐', description: 'Glowing superstar galaxy shower' },
  { id: 'gifts', label: 'Mystery Presents', icon: '🎁', description: 'Wrapped celebration presents & packages' },
  { id: 'rockets', label: 'Hype Rockets', icon: '🚀', description: 'Speeding rockets & hype bursts' },
  { id: 'custom', label: 'Custom Asset', icon: '🖼️', description: 'Upload your own custom PNG / GIF / image' }
];

export const PointsEconomyTab: React.FC<PointsEconomyTabProps> = ({
  economy,
  onUpdateEconomy,
  viewers,
  onAdjustPoints,
  onMassAirdrop,
  onTriggerPreview,
  onResetAllPoints
}) => {
  const [settings, setSettings] = useState<EconomySettings>(economy);
  const [searchQuery, setSearchQuery] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('500');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanCmdName = (settings.currencyName || 'coins').toLowerCase().replace(/[^a-z0-9]/g, '');

  const handleSave = () => {
    onUpdateEconomy(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAirdrop = () => {
    const amt = parseInt(airdropAmount, 10) || 500;
    onMassAirdrop(amt);
    soundSynth.play('jackpot');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSettings({
          ...settings,
          massDropPreset: 'custom',
          customDropImageUrl: event.target.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredViewers = viewers
    .filter((v) => v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || v.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Airdrop Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 backdrop-blur-md">
            {settings.currencySymbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Points & Stream Economy</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {settings.currencyName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure earn rates, dynamic points commands (!{cleanCmdName} & !my{cleanCmdName}), and Mass Drop overlay animations
            </p>
          </div>
        </div>

        {/* Quick Airdrop Launcher */}
        <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-amber-500/30 backdrop-blur-md">
          <Gift className="w-4 h-4 text-amber-400 ml-2" />
          <input
            type="number"
            value={airdropAmount}
            onChange={(e) => setAirdropAmount(e.target.value)}
            className="w-24 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400/50"
          />
          <button
            onClick={handleAirdrop}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mass Airdrop</span>
          </button>
          {onResetAllPoints && (
            <button
              onClick={() => {
                if (confirm("⚠️ WARNING: Are you sure you want to clear all points for all users? This will wipe the economy leaderboard!")) {
                  onResetAllPoints();
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Points</span>
            </button>
          )}
        </div>
      </div>

      {/* 2 Column Settings & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Economy Config & Mass Drop Form */}
        <div className="space-y-6">
          {/* Section 1: Currency & Earn Rates */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Currency & Earn Settings
              </h2>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Currency Name:</label>
                <input
                  type="text"
                  value={settings.currencyName}
                  onChange={(e) => setSettings({ ...settings, currencyName: e.target.value })}
                  placeholder="DroidCoins"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400/50 backdrop-blur-md"
                />
                {/* Dynamic Command Preview Under Header */}
                <div className="mt-1.5 p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-start gap-2">
                  <Terminal className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-purple-200">
                    <span className="font-bold text-white">Active Chat Command Aliases: </span>
                    <span className="font-mono text-cyan-300 font-extrabold">!{cleanCmdName}</span>
                    <span className="text-slate-400">, </span>
                    <span className="font-mono text-pink-300 font-extrabold">!my{cleanCmdName}</span>
                    <span className="text-slate-400">, </span>
                    <span className="font-mono text-purple-300">!points</span>
                    <span className="text-slate-400">, </span>
                    <span className="font-mono text-purple-300">!coins</span>
                    <p className="text-[10px] text-purple-300/80 mt-0.5">
                      Changing the name automatically updates <code className="text-white">!my{cleanCmdName}</code> and <code className="text-white">!{cleanCmdName}</code> for chatters.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Currency Symbol:</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400/50 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Points Per Minute Watched: <span className="text-amber-400 font-bold font-mono">+{settings.pointsPerMinute}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.pointsPerMinute}
                  onChange={(e) => setSettings({ ...settings, pointsPerMinute: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Points Per Chat Message: <span className="text-amber-400 font-bold font-mono">+{settings.pointsPerMessage}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.pointsPerMessage}
                  onChange={(e) => setSettings({ ...settings, pointsPerMessage: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subscriber Multiplier: <span className="text-amber-400 font-bold font-mono">{settings.subBonusMultiplier}x</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={settings.subBonusMultiplier}
                  onChange={(e) => setSettings({ ...settings, subBonusMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Daily Streak Bonus: <span className="text-amber-400 font-bold font-mono">+{settings.dailyStreakBonus} pts</span>
                </label>
                <input
                  type="number"
                  value={settings.dailyStreakBonus}
                  onChange={(e) => setSettings({ ...settings, dailyStreakBonus: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400/50 backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mass Drop Screen Overlay Customizer */}
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-purple-500/20 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                Mass Drop Fullscreen Overlay
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.massDropOverlayEnabled ?? true}
                  onChange={(e) => setSettings({ ...settings, massDropOverlayEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <p className="text-xs text-slate-400">
              When Mass Drop is triggered, generic items or custom images cascade over the stream broadcast overlay.
            </p>

            <div className="space-y-4 text-xs">
              {/* Presets Grid */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Select Overlay Preset:</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_OPTIONS.map((opt) => {
                    const isSelected = (settings.massDropPreset || 'coins') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, massDropPreset: opt.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-500/20'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold truncate text-xs">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{opt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Upload if Preset is 'custom' */}
              {settings.massDropPreset === 'custom' && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                      Custom Drop Asset
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 border border-pink-400/40 text-pink-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Or Enter Image URL:</label>
                    <input
                      type="text"
                      value={settings.customDropImageUrl || ''}
                      onChange={(e) => setSettings({ ...settings, customDropImageUrl: e.target.value })}
                      placeholder="https://example.com/emote.png"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  {settings.customDropImageUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/10">
                      <img
                        src={settings.customDropImageUrl}
                        alt="Custom drop asset preview"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain rounded-md bg-white/5"
                      />
                      <div className="text-[11px] text-slate-300">
                        <div className="font-bold text-white">Asset Preview Ready</div>
                        <div className="text-slate-400 text-[10px]">Will rain {settings.massDropParticleCount || 75} items on drop</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Particle Density Slider */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Particle Density: <span className="text-purple-300 font-bold font-mono">{settings.massDropParticleCount || 75} items</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={settings.massDropParticleCount || 75}
                  onChange={(e) => setSettings({ ...settings, massDropParticleCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Instant Test Overlay Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  onMassAirdrop(0); // Trigger overlay test
                  soundSynth.play('jackpot');
                }}
                className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>Test Overlay Screen Drop Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Leaderboard & Balance Adjustments */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-extrabold text-white">Community {settings.currencyName} Leaderboard</h2>
                <p className="text-xs text-slate-400">Total {viewers.length} registered viewers</p>
              </div>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search viewer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 backdrop-blur-md"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredViewers.map((viewer, rank) => (
              <div
                key={viewer.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 hover:bg-white/[0.05] transition-all backdrop-blur-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 text-center font-mono font-extrabold text-xs ${
                    rank === 0 ? 'text-amber-400 text-sm' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{rank + 1}
                  </span>

                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${viewer.avatarColor} flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0`}>
                    {viewer.displayName[0]}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate">{viewer.displayName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10 uppercase">
                        {viewer.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {viewer.watchTimeMinutes} mins watched • {viewer.messageCount} messages
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      {viewer.points.toLocaleString()} {settings.currencySymbol}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Earned: {viewer.totalPointsEarned.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustPoints(viewer.username, -100)}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-slate-300 hover:text-red-200 border border-white/10 flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Deduct 100 points"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onAdjustPoints(viewer.username, 100)}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 border border-white/10 flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Add 100 points"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
