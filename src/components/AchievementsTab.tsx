import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Check, Sparkles, Award, Users, Shield } from 'lucide-react';
import { Achievement, ViewerProfile } from '../types';

interface AchievementsTabProps {
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  profiles: ViewerProfile[];
  onSaveNotice: () => void;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  achievements,
  setAchievements,
  profiles,
  onSaveNotice
}) => {
  // New Achievement Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('🏆');
  const [newCategory, setNewCategory] = useState<Achievement['category']>('watchtime');
  const [newTarget, setNewTarget] = useState<number>(6000);
  const [newRewardPoints, setNewRewardPoints] = useState<number>(1000);
  const [newRewardItem, setNewRewardItem] = useState('');

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const ach: Achievement = {
      id: `ach-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || `Milestone for ${newCategory}`,
      icon: newIcon.trim() || '🏆',
      category: newCategory,
      targetValue: Number(newTarget) || 100,
      rewardPoints: Number(newRewardPoints) || 0,
      rewardItemName: newRewardItem.trim() || undefined,
      enabled: true
    };

    setAchievements((prev) => [...prev, ach]);
    setNewTitle('');
    setNewDescription('');
    setNewRewardItem('');
    onSaveNotice();
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    onSaveNotice();
  };

  const handleToggle = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Community Achievements & Milestones</h2>
            <p className="text-xs text-slate-400">
              Automatic viewer telemetry tracking, watch-time badges, and inventory rewards
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Achievements Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => {
              // Count how many viewers unlocked this
              const unlockCount = profiles.filter((p) =>
                p.achievements?.some((a) => a.achievementId === ach.id)
              ).length;

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    ach.enabled
                      ? 'bg-slate-900/90 border-slate-800 shadow-md'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {ach.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-xs">{ach.title}</h3>
                        <p className="text-[11px] text-slate-400 leading-snug">{ach.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 font-mono">
                            Target: {ach.targetValue.toLocaleString()} {ach.category === 'watchtime' ? 'mins' : ach.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 font-mono">
                            +{ach.rewardPoints} Points
                          </span>
                          {ach.rewardItemName && (
                            <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
                              🎁 {ach.rewardItemName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(ach.id)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                          ach.enabled ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {ach.enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3 h-3 text-purple-400" />
                      <span>{unlockCount} / {profiles.length} Viewers Unlocked</span>
                    </span>
                    <span className="font-mono text-purple-400">Auto-Tracking Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Create Custom Achievement (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Create New Achievement</span>
          </h3>

          <form onSubmit={handleAddAchievement} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Achievement Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. 100-Hour Centurion"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. Watch the stream for 100 total hours."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Icon Emoji</label>
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 text-center"
                  placeholder="🏆"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Track Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="watchtime">Watch Time (Minutes)</option>
                  <option value="messages">Chat Messages Count</option>
                  <option value="points">Points Earned</option>
                  <option value="streak">Stream Visit Streak</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Goal Value</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reward Points</label>
                <input
                  type="number"
                  value={newRewardPoints}
                  onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Inventory Reward Item (Optional)</label>
              <input
                type="text"
                value={newRewardItem}
                onChange={(e) => setNewRewardItem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. 🏆 Centurion Trophy Badge"
              />
              <p className="text-[10px] text-slate-500 mt-1">Saved permanently to the viewer's personal inventory upon unlock.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Achievement</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
