import React, { useState } from 'react';
import { 
  Gamepad2, 
  Sword, 
  Skull, 
  Users, 
  TrendingUp, 
  Play, 
  Square, 
  Trophy,
  Dices,
  Flame,
  UserPlus,
  Coins,
  Percent,
  Zap,
  Target
} from 'lucide-react';
import { GameState, ViewerProfile, PointsConfig } from '../types';

interface GamesTabProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  profiles: ViewerProfile[];
  pointsConfig: PointsConfig;
  onTriggerBotMessage: (msg: string) => void;
  onSaveNotice: () => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  gameState,
  setGameState,
  profiles,
  pointsConfig,
  onTriggerBotMessage,
  onSaveNotice
}) => {
  const [newBossName, setNewBossName] = useState('Cyber-Overlord');
  const [newBossHP, setNewBossHP] = useState(1000);

  const updateConfig = (key: keyof typeof gameState.config, value: number) => {
    setGameState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
    onSaveNotice();
  };

  const startBoss = () => {
    setGameState(prev => ({
      ...prev,
      isBossActive: true,
      bossName: newBossName,
      bossHealth: newBossHP,
      bossMaxHealth: newBossHP
    }));
    onTriggerBotMessage(`⚔️ A wild BOSS [${newBossName}] has appeared! Use !attack to help defeat them! (${newBossHP} HP)`);
  };

  const stopBoss = () => {
    setGameState(prev => ({ ...prev, isBossActive: false }));
    onTriggerBotMessage(`🏳️ The Boss [${gameState.bossName}] has retreated... for now.`);
  };

  const startHeist = () => {
    setGameState(prev => ({
      ...prev,
      isHeistActive: true,
      heistParticipants: [],
      heistStartTime: new Date().toISOString()
    }));
    onTriggerBotMessage(`💰 A HEIST is starting! Type "!heist <amount>" to join the crew! Starting in 2 minutes.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Interactive Chat Games</h2>
            <p className="text-xs text-slate-400">
              Manage live engagement events like Boss Battles, Heists, and Community Challenges
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Boss Battle Management (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Boss Battle Instance</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                gameState.isBossActive 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {gameState.isBossActive ? 'ACTIVE BATTLE' : 'STANDBY'}
              </span>
            </div>

            {gameState.isBossActive ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                  <div className="relative">
                    <Skull className="w-16 h-16 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full animate-ping" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">{gameState.bossName}</h4>
                    <p className="text-xs text-slate-400 font-mono">Current Health: {gameState.bossHealth} / {gameState.bossMaxHealth} HP</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
                      style={{ width: `${(gameState.bossHealth / gameState.bossMaxHealth) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0 HP</span>
                    <span>{Math.round((gameState.bossHealth / gameState.bossMaxHealth) * 100)}% REMAINING</span>
                    <span>{gameState.bossMaxHealth} HP</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={stopBoss}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    <span>FORCE END BATTLE</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Boss Name</label>
                    <input 
                      type="text"
                      value={newBossName}
                      onChange={(e) => setNewBossName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Total Health (HP)</label>
                    <input 
                      type="number"
                      value={newBossHP}
                      onChange={(e) => setNewBossHP(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <button
                  onClick={startBoss}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>SUMMON BOSS TO CHAT</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase">Engagement Stats</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Top Gambler</div>
                <div className="text-xs font-black text-white">@HyperViewer</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Boss Damage</div>
                <div className="text-xs font-black text-white">12.4k HP</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Heist Wins</div>
                <div className="text-xs font-black text-white">42 Sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Heist, Coin Pusher & Quick Games (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase">Coin Pusher Status</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            
            <div className="flex flex-col items-center py-4 space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <div className="relative">
                <Coins className="w-12 h-12 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-bounce" />
                <Zap className="absolute -bottom-1 -right-1 w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{gameState.pusherPool.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{pointsConfig.currencyName} In Pool</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGameState(prev => ({ ...prev, pusherPool: 0 }))}
                className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold transition-all border border-slate-700 cursor-pointer"
              >
                RESET POOL
              </button>
              <button
                onClick={() => onTriggerBotMessage(`🪙 THE PUSHER IS LOADED! ${gameState.pusherPool} ${pointsConfig.currencyName} are waiting to be pushed! Type "!coinpush <amount>" to try and tip it!`)}
                className="py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-bold transition-all border border-emerald-500/30 cursor-pointer"
              >
                ALERT CHAT
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase">Heist Control</h3>
              </div>
              {gameState.isHeistActive && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 animate-pulse">
                  <Flame className="w-3 h-3" />
                  IN PROGRESS
                </span>
              )}
            </div>

            {gameState.isHeistActive ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-center space-y-2">
                  <div className="text-2xl font-black text-amber-400">{gameState.heistParticipants.length}</div>
                  <div className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Crew Members Ready</div>
                </div>
                <div className="max-h-[120px] overflow-y-auto scrollbar-thin space-y-1">
                  {gameState.heistParticipants.map((p, i) => (
                    <div key={i} className="flex justify-between text-[10px] p-1.5 rounded bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-300">@{p.username}</span>
                      <span className="text-amber-400 font-mono">+{p.bid} {pointsConfig.currencySymbol}</span>
                    </div>
                  ))}
                  {gameState.heistParticipants.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-[10px]">No participants yet.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start a group heist where viewers bet their {pointsConfig.currencyName} to pull off a job. 
                  High risk, massive rewards for the survivors!
                </p>
                <button
                  onClick={startHeist}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>START HEIST EVENT</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Dices className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase">Mini-Game Triggers</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onTriggerBotMessage('🎲 Everyone! Type "!gamble <amount>" to test your luck right now!')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400">Quick Gamble Alert</div>
                  <div className="text-[10px] text-slate-500 italic">Calls chat to gamble points</div>
                </div>
                <Play className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => onTriggerBotMessage('⚔️ Who is the strongest? Type "!duel <username> <amount>" to challenge someone!')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-rose-400">PVP Duel Invite</div>
                  <div className="text-[10px] text-slate-500 italic">Suggests a 1v1 battle</div>
                </div>
                <UserPlus className="w-3 h-3 text-slate-600 group-hover:text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts & Game Configuration Section */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payouts & Game Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gamble Settings */}
          <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Gamble Settings</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Win Chance (%)</label>
                  <span className="text-[10px] font-mono text-blue-400">{gameState.config.gambleWinChance}%</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="99"
                  value={gameState.config.gambleWinChance}
                  onChange={(e) => updateConfig('gambleWinChance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Heist Settings */}
          <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Heist Settings</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Success Chance (%)</label>
                  <span className="text-[10px] font-mono text-amber-400">{gameState.config.heistSuccessChance}%</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="99"
                  value={gameState.config.heistSuccessChance}
                  onChange={(e) => updateConfig('heistSuccessChance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase italic">Min Multiplier</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={gameState.config.heistMinMultiplier}
                    onChange={(e) => updateConfig('heistMinMultiplier', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase italic">Max Multiplier</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={gameState.config.heistMaxMultiplier}
                    onChange={(e) => updateConfig('heistMaxMultiplier', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coin Pusher Settings */}
          <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Coin Pusher Configuration</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tip Chance (%)</label>
                  <span className="text-[10px] font-mono text-emerald-400">{gameState.config.coinPushTipChance}%</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="50"
                  value={gameState.config.coinPushTipChance}
                  onChange={(e) => updateConfig('coinPushTipChance', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="p-2 bg-slate-900/50 rounded border border-slate-800/50">
                <p className="text-[9px] text-slate-500 italic leading-tight">
                  Chance to tip on every drop. Low chance makes the pool grow larger. High chance makes wins more frequent but smaller.
                </p>
              </div>
            </div>
          </div>

          {/* Boss & Duel Settings */}
          <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sword className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">Boss & Duel Payouts</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Boss Kill Reward ({pointsConfig.currencySymbol})</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={gameState.config.bossKillReward}
                    onChange={(e) => updateConfig('bossKillReward', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <Coins className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duel House Cut (%)</label>
                  <span className="text-[10px] font-mono text-rose-400">{gameState.config.duelHouseCut}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="50"
                  value={gameState.config.duelHouseCut}
                  onChange={(e) => updateConfig('duelHouseCut', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-center gap-3">
          <Percent className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Changes to payouts and win rates take effect immediately for all active chat games. Higher win rates increase chat engagement but will accelerate {pointsConfig.currencyName} inflation.
          </p>
        </div>
      </div>
    </div>
  );
};
