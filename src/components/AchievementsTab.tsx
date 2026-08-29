import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Trophy,
  Play,
  Plus,
  Trash2,
  Check,
  Shield,
  Layers,
  Users,
  Gamepad2,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { AchievementItem, EconomySettings, ViewerProfile } from '../types';

interface AchievementsTabProps {
  achievements: AchievementItem[];
  viewers?: ViewerProfile[];
  onAddAchievement: (item: AchievementItem) => void;
  onUpdateAchievement?: (item: AchievementItem) => void;
  onDeleteAchievement?: (id: string) => void;
  onTriggerAchievementAlert: (achievement: AchievementItem, username?: string) => void;
  economy: EconomySettings;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  viewers = [],
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  onTriggerAchievementAlert,
  economy
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState('500');
  const [newGamerscore, setNewGamerscore] = useState('50');
  const [newTrophyTier, setNewTrophyTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('gold');
  const [newPreset, setNewPreset] = useState<'xbox' | 'playstation' | 'steam' | 'generic'>('xbox');
  const [newIcon, setNewIcon] = useState('🏆');

  const [selectedChatter, setSelectedChatter] = useState<string>(
    viewers[0]?.username || 'PixelKnight'
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const ach: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      rewardPoints: parseInt(newPoints, 10) || 500,
      gamerscore: parseInt(newGamerscore, 10) || 50,
      trophyTier: newTrophyTier,
      bannerPreset: newPreset,
      icon: newIcon,
      requirementType: 'custom',
      requirementCount: 1,
      unlockedCount: 0
    };

    onAddAchievement(ach);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const getPresetBadge = (ach: AchievementItem) => {
    switch (ach.bannerPreset) {
      case 'xbox':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span>💚</span> XBOX
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-200 border border-emerald-500/30">
              {ach.gamerscore || 50}G
            </span>
          </div>
        );
      case 'playstation':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
              <span>🏆</span> PS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-950 text-blue-200 border border-blue-500/30">
              {ach.trophyTier || 'GOLD'}
            </span>
          </div>
        );
      case 'steam':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <span>⭐</span> STEAM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            CYBER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 backdrop-blur-md">
            🏆
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Console Achievements & Trophies</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Xbox GamerScore (50G), PlayStation Trophies (Platinum/Gold), and Steam Badges with live OBS notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold">Test Chatter:</span>
            <select
              value={selectedChatter}
              onChange={(e) => setSelectedChatter(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              {viewers.length > 0 ? (
                viewers.map((v) => (
                  <option key={v.id} value={v.username} className="bg-slate-900 text-white">
                    @{v.username}
                  </option>
                ))
              ) : (
                <>
                  <option value="PixelKnight" className="bg-slate-900 text-white">@PixelKnight</option>
                  <option value="Luna_Starlight" className="bg-slate-900 text-white">@Luna_Starlight</option>
                  <option value="CyberSamurai" className="bg-slate-900 text-white">@CyberSamurai</option>
                </>
              )}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-md shadow-amber-500/20 border border-amber-400/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Achievement</span>
          </button>
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-5 rounded-2xl backdrop-blur-2xl border flex flex-col justify-between space-y-4 transition-all group shadow-[0_16px_36px_rgba(0,0,0,0.3)] ${
              ach.bannerPreset === 'xbox'
                ? 'bg-gradient-to-br from-emerald-950/30 to-slate-950/60 border-emerald-500/30 hover:border-emerald-500/50'
                : ach.bannerPreset === 'playstation'
                ? 'bg-gradient-to-br from-blue-950/30 to-slate-950/60 border-blue-500/30 hover:border-blue-500/50'
                : 'bg-gradient-to-br from-cyan-950/30 to-slate-950/60 border-cyan-500/30 hover:border-cyan-500/50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
                    {ach.icon}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{ach.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-amber-300 font-mono">
                        +{ach.rewardPoints.toLocaleString()} {economy.currencySymbol}
                      </span>
                    </div>
                  </div>
                </div>

                {getPresetBadge(ach)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{ach.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Users className="w-3 h-3" />
                {ach.unlockedCount ?? 0} unlocked
              </span>

              <div className="flex items-center gap-2">
                {onDeleteAchievement && (
                  <button
                    onClick={() => onDeleteAchievement(ach.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onTriggerAchievementAlert(ach, selectedChatter)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test ({selectedChatter})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                Create Console Achievement / Trophy
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Achievement Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Master Heist Operative"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description:</label>
                <textarea
                  placeholder="e.g. Successfully escape the high-security bank vault with over 3,000 points."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400 resize-none h-18"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Banner Preset Style:</label>
                  <select
                    value={newPreset}
                    onChange={(e) => setNewPreset(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="xbox" className="bg-slate-900">Xbox Achievement (Green)</option>
                    <option value="playstation" className="bg-slate-900">PlayStation Trophy (Blue)</option>
                    <option value="steam" className="bg-slate-900">Steam Badge (Cyan)</option>
                  </select>
                </div>

                {newPreset === 'xbox' ? (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Gamerscore (G):</label>
                    <input
                      type="number"
                      value={newGamerscore}
                      onChange={(e) => setNewGamerscore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                ) : newPreset === 'playstation' ? (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Trophy Tier:</label>
                    <select
                      value={newTrophyTier}
                      onChange={(e) => setNewTrophyTier(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="bronze" className="bg-slate-900">Bronze</option>
                      <option value="silver" className="bg-slate-900">Silver</option>
                      <option value="gold" className="bg-slate-900">Gold</option>
                      <option value="platinum" className="bg-slate-900">Platinum</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Icon Emoji:</label>
                    <input
                      type="text"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Reward Points:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Display Icon:</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
