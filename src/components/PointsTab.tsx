import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Minus,
  Trophy,
  Sparkles,
  Check,
  Users,
  Gift,
  RotateCcw,
  AlertTriangle,
  CloudRain,
  Zap
} from 'lucide-react';
import { PointsConfig, ViewerProfile } from '../types';

interface PointsTabProps {
  pointsConfig: PointsConfig;
  setPointsConfig: React.Dispatch<React.SetStateAction<PointsConfig>>;
  profiles: ViewerProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<ViewerProfile[]>>;
  onSaveNotice: () => void;
}

export const PointsTab: React.FC<PointsTabProps> = ({
  pointsConfig,
  setPointsConfig,
  profiles,
  setProfiles,
  onSaveNotice
}) => {
  const [currencyName, setCurrencyName] = useState(pointsConfig.currencyName);
  const [currencySymbol, setCurrencySymbol] = useState(pointsConfig.currencySymbol);
  const [pointsPerMsg, setPointsPerMsg] = useState(pointsConfig.pointsPerMessage);
  const [pointsPerInterval, setPointsPerInterval] = useState(pointsConfig.pointsPerIntervalMinutes);
  const [intervalMins, setIntervalMins] = useState(pointsConfig.intervalMinutes);
  const [subMultiplier, setSubMultiplier] = useState(pointsConfig.subBonusMultiplier);
  const [vipMultiplier, setVipMultiplier] = useState(pointsConfig.vipBonusMultiplier);

  // Manual Grant State
  const [selectedUser, setSelectedUser] = useState<string>(profiles[0]?.username || '');
  const [grantAmount, setGrantAmount] = useState<number>(100);

  // Bulk Actions State
  const [massAmount, setMassAmount] = useState<number>(250);
  const [isResetConfirming, setIsResetConfirming] = useState<boolean>(false);
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  const handleSaveConfig = () => {
    setPointsConfig({
      currencyName: currencyName.trim() || 'Points',
      currencySymbol: currencySymbol.trim() || '🪙',
      pointsPerMessage: Number(pointsPerMsg) || 5,
      pointsPerIntervalMinutes: Number(pointsPerInterval) || 20,
      intervalMinutes: Number(intervalMins) || 10,
      subBonusMultiplier: Number(subMultiplier) || 1.5,
      vipBonusMultiplier: Number(vipMultiplier) || 1.25,
      enabled: true
    });
    onSaveNotice();
  };

  const handleAdjustPoints = (multiplier: number) => {
    const delta = grantAmount * multiplier;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.username.toLowerCase() === selectedUser.toLowerCase()) {
          const newBal = Math.max(0, p.points + delta);
          return {
            ...p,
            points: newBal,
            totalPointsEarned: delta > 0 ? p.totalPointsEarned + delta : p.totalPointsEarned
          };
        }
        return p;
      })
    );
    onSaveNotice();
  };

  // Give Everyone in Chat X Amount of Points
  const handleGiveEveryonePoints = () => {
    if (massAmount <= 0) return;
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        points: p.points + massAmount,
        totalPointsEarned: p.totalPointsEarned + massAmount
      }))
    );
    setLastActionNotice(`🎉 Awarded +${massAmount} ${currencyName} to all ${profiles.length} viewers in chat!`);
    onSaveNotice();
    setTimeout(() => setLastActionNotice(null), 4000);
  };

  // Reset All Points to 0
  const handleResetAllPoints = (resetTotalHistory: boolean = false) => {
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        points: 0,
        totalPointsEarned: resetTotalHistory ? 0 : p.totalPointsEarned
      }))
    );
    setIsResetConfirming(false);
    setLastActionNotice(`🔄 All viewer balances reset to 0 ${currencyName}.`);
    onSaveNotice();
    setTimeout(() => setLastActionNotice(null), 4000);
  };

  // Sort Leaderboard
  const leaderboard = [...profiles].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Points & Stream Economy System</h2>
            <p className="text-xs text-slate-400">
              Cross-stream persistent viewer balances, custom currency rates, and reward inventory
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Save Economy Settings</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {lastActionNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>{lastActionNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Economy Configuration & Manual Awarding (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Economy Settings Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Currency Naming & Earning Rules</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Currency Name</label>
                <input
                  type="text"
                  value={currencyName}
                  onChange={(e) => setCurrencyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. DroidCoins"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Symbol / Emoji</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
                  placeholder="🪙"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Points Per Chat Message</label>
                <input
                  type="number"
                  value={pointsPerMsg}
                  onChange={(e) => setPointsPerMsg(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Points Per {intervalMins} Mins Watch Time
                </label>
                <input
                  type="number"
                  value={pointsPerInterval}
                  onChange={(e) => setPointsPerInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscriber Bonus Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={subMultiplier}
                  onChange={(e) => setSubMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">VIP Bonus Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={vipMultiplier}
                  onChange={(e) => setVipMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Manual Point Granter Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Broadcaster Manual Balance Adjustment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Viewer</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.username}>
                      {p.username} ({p.points.toLocaleString()} {currencyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount</label>
                <input
                  type="number"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAdjustPoints(1)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Award +{grantAmount} {currencyName}</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdjustPoints(-1)}
                className="py-2 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
                <span>Deduct</span>
              </button>
            </div>
          </div>

          {/* Mass Points Giveaway (Chat Rain / Give Everyone X Points) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>Give Everyone in Chat Points (Mass Airdrop)</span>
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {profiles.length} Viewers
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Distribute a custom amount of {currencyName} to every viewer profile in your community simultaneously.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-slate-300 font-semibold mb-1">Points per Viewer (X)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={massAmount}
                    onChange={(e) => setMassAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    placeholder="e.g. 250"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 font-mono">{currencySymbol}</span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div className="flex items-center gap-1.5 pt-4">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMassAmount(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      massAmount === preset
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGiveEveryonePoints}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Give Everyone +{massAmount} {currencyName} ({massAmount * profiles.length} Total Distributed)</span>
            </button>
          </div>

          {/* Reset All Points to 0 Card */}
          <div className="bg-slate-900/90 border border-red-950/60 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-red-950/80">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset All Points to 0 (Season / Leaderboard Wipe)</span>
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/40">
                Danger Zone
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Resets active {currencyName} balances to 0 for all viewer profiles. Choose whether to zero active balances only or reset lifetime points earned as well.
            </p>

            {isResetConfirming ? (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 space-y-3">
                <div className="flex items-start gap-2 text-red-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    Are you sure you want to reset all <strong>{profiles.length} viewer balances to 0 {currencySymbol}</strong>? This cannot be undone.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResetAllPoints(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer text-xs shadow-md shadow-red-600/30"
                  >
                    Confirm: Reset Balances to 0 (Keep Total History)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetAllPoints(true)}
                    className="py-2 px-3 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold cursor-pointer text-xs"
                  >
                    Full Wipe (Reset Lifetime Too)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirming(false)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetConfirming(true)}
                className="py-2 px-4 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset All Points to 0</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Leaderboard & Inventory Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                Top {currencyName} Balances
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">{profiles.length} total viewers</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[460px] scrollbar-thin">
            {leaderboard.map((viewer, idx) => (
              <div
                key={viewer.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      idx === 0
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                        : idx === 1
                        ? 'bg-slate-300 text-black'
                        : idx === 2
                        ? 'bg-amber-800 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{viewer.username}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {viewer.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {viewer.inventory.length} items • {viewer.achievements.length} achievements
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-amber-300 text-sm">
                    {viewer.points.toLocaleString()} {currencySymbol}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Total: {viewer.totalPointsEarned.toLocaleString()}
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
