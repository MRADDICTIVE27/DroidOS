import React, { useState, useEffect } from 'react';
import {
  Dice5,
  Swords,
  Shield,
  Coins,
  Sparkles,
  Flame,
  Zap,
  Play,
  RotateCw,
  Trophy,
  AlertTriangle,
  Sliders,
  Clock,
  Skull,
  ShieldAlert,
  Snowflake,
  Activity,
  CheckCircle2,
  Lock,
  Volume2
} from 'lucide-react';
import {
  EconomySettings,
  ViewerProfile,
  BossItem,
  BossFailureEffect,
  ChatGamesSettings,
  AchievementItem
} from '../types';
import { soundSynth } from '../services/soundSynthesizer';
import { DEFAULT_BOSSES, DEFAULT_CHAT_GAMES_SETTINGS } from '../data/defaultData';
import { saveChatGamesSettingsLocal } from '../services/localDataStorage';

interface ChatGamesTabProps {
  economy: EconomySettings;
  viewers: ViewerProfile[];
  onUpdateViewers?: (viewers: ViewerProfile[]) => void;
  onTriggerGameOverlay: (
    gameId: string,
    outcome: string,
    title: string,
    subtitle: string,
    extra?: any
  ) => void;
  achievements?: AchievementItem[];
  onUnlockAchievement?: (achievementId: string, username: string) => void;
}

export const ChatGamesTab: React.FC<ChatGamesTabProps> = ({
  economy,
  viewers,
  onUpdateViewers,
  onTriggerGameOverlay,
  achievements = [],
  onUnlockAchievement
}) => {
  const [activeGame, setActiveGame] = useState<'slots' | 'boss' | 'heist' | 'duel' | 'coinpush' | 'settings'>('slots');

  // Game Settings & Payout Sliders (Loaded from Local Storage for stream persistence)
  const [settings, setSettings] = useState<ChatGamesSettings>(DEFAULT_CHAT_GAMES_SETTINGS);

  useEffect(() => {
    fetch('/api/data/chatGamesSettings')
      .then(r => r.json())
      .then(res => {
        if (res.data) setSettings({ ...DEFAULT_CHAT_GAMES_SETTINGS, ...res.data });
      })
      .catch(() => {});
  }, []);

  // Save settings whenever changed
  const updateSettings = (partial: Partial<ChatGamesSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveChatGamesSettingsLocal(next);
      return next;
    });
  };

  // 1. Slot Machine state
  const [slotBet, setSlotBet] = useState(100);
  const [reels, setReels] = useState(['🍒', '7️⃣', '💎']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  // 2. Boss Raid state
  const [bossList] = useState<BossItem[]>(DEFAULT_BOSSES);
  const [selectedBossIndex, setSelectedBossIndex] = useState(0);
  const currentBoss = bossList[selectedBossIndex] || bossList[0];

  const [isBossActive, setIsBossActive] = useState(false);
  const [bossHp, setBossHp] = useState<number>(currentBoss.maxHp);
  const [bossMaxHp, setBossMaxHp] = useState<number>(currentBoss.maxHp);
  const [bossTimer, setBossTimer] = useState<number>(currentBoss.timerSeconds);
  const [bossLog, setBossLog] = useState<string[]>([]);
  const [failureOverlayActive, setFailureOverlayActive] = useState<{
    effect: BossFailureEffect;
    title: string;
    subtitle: string;
  } | null>(null);

  // 3. Heist state
  const [heistVault, setHeistVault] = useState(12800);
  const [heistStatus, setHeistStatus] = useState<'ready' | 'running' | 'success' | 'busted'>('ready');
  const [heistMessage, setHeistMessage] = useState<string | null>(null);

  // 4. Duel state
  const [p1, setP1] = useState(viewers[0]?.username || 'PixelKnight');
  const [p2, setP2] = useState(viewers[1]?.username || 'Luna_Starlight');
  const [duelPurse, setDuelPurse] = useState(300);
  const [duelWinner, setDuelWinner] = useState<string | null>(null);

  // 5. Coin Pusher state
  const [pusherPool, setPusherPool] = useState(1250);
  const [pusherDropResult, setPusherDropResult] = useState<string | null>(null);

  // Live countdown timer for persistent Boss Raid
  useEffect(() => {
    if (!isBossActive) return;

    const interval = setInterval(() => {
      setBossTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleBossTimeout();
          return 0;
        }

        // Broadcast current boss state to OBS
        try {
          const channel = new BroadcastChannel('droidos_alerts');
          channel.postMessage({
            id: `boss-tick-${Date.now()}`,
            type: 'boss_attack',
            bossName: currentBoss.name,
            subtitle: currentBoss.title,
            icon: currentBoss.icon,
            currentHp: bossHp,
            maxHp: bossMaxHp,
            remainingSeconds: prev - 1,
            timestamp: Date.now()
          });
          channel.close();
        } catch {}

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBossActive, bossHp, bossMaxHp, currentBoss]);

  // Handle Boss Timeout Failure Effect
  const handleBossTimeout = () => {
    setIsBossActive(false);
    const effect = currentBoss.failureEffect;

    setFailureOverlayActive({
      effect,
      title: currentBoss.failureTitle,
      subtitle: currentBoss.failureSubtitle
    });

    if (effect === 'fireball') soundSynth.play('fireball');
    else if (effect === 'cyber_glitch') soundSynth.play('cyber_glitch');
    else if (effect === 'freeze_screen') soundSynth.play('freeze_crack');
    else soundSynth.play('void_collapse');

    // Trigger failure alert to OBS
    onTriggerGameOverlay(
      'boss_failure',
      'failure',
      currentBoss.failureTitle,
      currentBoss.failureSubtitle,
      {
        bossFailureEffect: effect,
        duration: settings.previewDurationSeconds || 6
      }
    );

    setBossLog((prev) => [
      `💀 TIME OUT! ${currentBoss.name} executed ${currentBoss.failureTitle}! Raid Failed!`,
      ...prev
    ]);

    setTimeout(() => {
      setFailureOverlayActive(null);
    }, 7000);
  };

  // Start / Reset Boss Raid
  const handleStartBoss = (bossIdx: number) => {
    setSelectedBossIndex(bossIdx);
    const boss = bossList[bossIdx];
    setBossHp(boss.maxHp);
    setBossMaxHp(boss.maxHp);
    setBossTimer(boss.timerSeconds);
    setIsBossActive(true);
    setFailureOverlayActive(null);
    soundSynth.play('laser');

    setBossLog([
      `⚔️ ${boss.icon} ${boss.name} (${boss.title}) emerged with ${boss.maxHp.toLocaleString()} HP! Timer: ${boss.timerSeconds}s!`
    ]);

    onTriggerGameOverlay(
      'boss_attack',
      'active',
      `${boss.name.toUpperCase()} HAS SPAWNED!`,
      `${boss.maxHp.toLocaleString()} HP • ${boss.timerSeconds}s Time Limit`,
      {
        bossName: boss.name,
        subtitle: boss.title,
        icon: boss.icon,
        currentHp: boss.maxHp,
        maxHp: boss.maxHp,
        remainingSeconds: boss.timerSeconds,
        duration: settings.previewDurationSeconds || 6
      }
    );
  };

  // Attack Boss Handler
  const handleAttackBoss = (attackerName: string = 'PixelKnight') => {
    if (!isBossActive || bossHp <= 0) return;

    soundSynth.play('laser');
    const baseDmg = Math.floor(Math.random() * 350 + 200);
    const isCrit = Math.random() > 0.65;
    const finalDmg = isCrit ? baseDmg * 2 : baseDmg;
    const nextHp = Math.max(0, bossHp - finalDmg);
    setBossHp(nextHp);

    const logEntry = `@${attackerName} dealt ${finalDmg.toLocaleString()} ${isCrit ? '🔥 CRIT ' : ''}DMG to ${currentBoss.name}!`;
    setBossLog((prev) => [logEntry, ...prev.slice(0, 6)]);

    if (nextHp <= 0) {
      setIsBossActive(false);
      soundSynth.play('boss_defeat');

      // Reward points to viewers
      if (onUpdateViewers && viewers.length > 0) {
        onUpdateViewers(
          viewers.map((v) => ({ ...v, points: v.points + currentBoss.rewardPoints }))
        );
      }

      // Unlock Boss Defeat Achievement
      if (onUnlockAchievement) {
        onUnlockAchievement('ach-boss-1', attackerName);
      }

      onTriggerGameOverlay(
        'boss_defeat',
        'victory',
        `👑 ${currentBoss.name.toUpperCase()} SLAIN!`,
        `Chat was victorious! Every participant earned +${currentBoss.rewardPoints.toLocaleString()} ${economy.currencyName}!`,
        {
          bossName: currentBoss.name,
          duration: settings.previewDurationSeconds || 6
        }
      );
    } else {
      // Update persistent HUD in OBS
      try {
        const channel = new BroadcastChannel('droidos_alerts');
        channel.postMessage({
          id: `boss-atk-${Date.now()}`,
          type: 'boss_attack',
          bossName: currentBoss.name,
          subtitle: currentBoss.title,
          icon: currentBoss.icon,
          currentHp: nextHp,
          maxHp: bossMaxHp,
          remainingSeconds: bossTimer,
          timestamp: Date.now()
        });
        channel.close();
      } catch {}
    }
  };

  // 1. Slots Handler with Payout Sliders integration
  const slotSymbols = ['🍒', '7️⃣', '💎', '🍋', '⭐', '🔔', '🍀'];

  const handleSpinSlots = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSlotMessage(null);
    soundSynth.play('slot_spin');

    let counter = 0;
    const interval = setInterval(() => {
      setReels([
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)]
      ]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsSpinning(false);

        const roll = Math.random();
        // Use custom slider settings for probability & payouts
        const winChance = (settings.slotsWinChance || 40) / 100;
        const jackpotThreshold = 1 - winChance * 0.25;

        if (roll >= jackpotThreshold) {
          // Jackpot 7 7 7
          setReels(['7️⃣', '7️⃣', '7️⃣']);
          const winMultiplier = settings.slotsJackpotMultiplier || 10;
          const win = slotBet * winMultiplier;
          setSlotMessage(`🎉 TRIPLE 7 JACKPOT! Won +${win.toLocaleString()} ${economy.currencyName} (${winMultiplier}x payout)!`);
          soundSynth.play('jackpot');

          onTriggerGameOverlay('slots', 'jackpot', '🎰 TRIPLE 7 JACKPOT!', `Won +${win.toLocaleString()} ${economy.currencyName}`, {
            payoutAmount: win,
            gameType: 'slots',
            duration: settings.previewDurationSeconds || 5
          });
        } else if (roll >= 1 - winChance) {
          // Win 2 matching
          setReels(['💎', '🍒', '💎']);
          const winMultiplier = settings.slotsWinMultiplier || 2.5;
          const win = Math.floor(slotBet * winMultiplier);
          setSlotMessage(`✨ 2 MATCHES! Won +${win.toLocaleString()} ${economy.currencyName} (${winMultiplier}x payout)!`);
          soundSynth.play('victory');

          onTriggerGameOverlay('slots', 'win', '🎰 SLOTS WINNER', `Won +${win.toLocaleString()} ${economy.currencyName}`, {
            payoutAmount: win,
            gameType: 'slots',
            duration: settings.previewDurationSeconds || 5
          });
        } else {
          setReels(['🍋', '🔔', '🍀']);
          setSlotMessage(`❌ No matches. Lost ${slotBet} ${economy.currencyName}.`);
          soundSynth.play('error');
        }
      }
    }, 90);
  };

  // 3. Heist Handler with Payout Sliders and Achievement integration
  const handleRunHeist = () => {
    setHeistStatus('running');
    soundSynth.play('alarm');

    setTimeout(() => {
      const successRate = (settings.heistSuccessRate || 50) / 100;
      const win = Math.random() < successRate;

      if (win) {
        setHeistStatus('success');
        const multiplier = settings.heistVaultMultiplier || 2.5;
        const loot = Math.floor(1000 * multiplier);
        setHeistMessage(`🎉 Vault cracked! Crew escaped with +${loot.toLocaleString()} ${economy.currencyName} each (${multiplier}x multiplier)!`);
        soundSynth.play('jackpot');

        // Unlock Heist First Completion Achievement!
        if (onUnlockAchievement) {
          onUnlockAchievement('ach-heist-1', viewers[0]?.username || 'PixelKnight');
        }

        onTriggerGameOverlay(
          'heist',
          'success',
          '🏦 BANK HEIST SUCCESS!',
          `Vault breached! Crew secured +${loot.toLocaleString()} ${economy.currencyName}!`,
          {
            payoutAmount: loot,
            gameType: 'heist',
            duration: settings.previewDurationSeconds || 6
          }
        );
      } else {
        setHeistStatus('busted');
        setHeistMessage('🚨 Alarms tripped! SWAT boxed the crew in!');
        soundSynth.play('error');

        onTriggerGameOverlay(
          'heist',
          'busted',
          '🚨 HEIST BUSTED!',
          'Authorities surrounded the vault! All loot forfeited!',
          {
            gameType: 'heist',
            duration: settings.previewDurationSeconds || 5
          }
        );
      }
    }, 2200);
  };

  // 4. Duel Handler
  const handleRunDuel = () => {
    soundSynth.play('laser');
    const winP1 = Math.random() > 0.5;
    const winner = winP1 ? p1 : p2;
    setDuelWinner(winner);
    soundSynth.play('victory');

    const payout = Math.floor(duelPurse * (settings.duelPurseMultiplier || 2.0));

    onTriggerGameOverlay(
      'duel',
      'win',
      `⚔️ @${winner.toUpperCase()} VICTORIOUS!`,
      `Defeated opponent in high noon standoff & won ${payout.toLocaleString()} ${economy.currencyName}!`,
      {
        username: winner,
        payoutAmount: payout,
        gameType: 'duel',
        duration: settings.previewDurationSeconds || 5
      }
    );
  };

  // 5. Coin Pusher Handler
  const handleDropCoin = () => {
    soundSynth.play('coin');
    const roll = Math.random();
    const multiplier = settings.coinPusherJackpotMultiplier || 5.0;

    if (roll > 0.8) {
      // Avalanche
      const reward = Math.floor(180 * multiplier);
      setPusherDropResult(`✨ AVALANCHE! 42 coins cascaded off shelf (+${reward.toLocaleString()} pts)!`);
      soundSynth.play('jackpot');

      onTriggerGameOverlay(
        'coinpush',
        'jackpot',
        '🪙 COIN AVALANCHE!',
        `Massive cascade! +${reward.toLocaleString()} ${economy.currencyName} collected!`,
        {
          payoutAmount: reward,
          gameType: 'coinpush',
          duration: settings.previewDurationSeconds || 5
        }
      );
    } else if (roll > 0.4) {
      const reward = Math.floor(50 * multiplier * 0.4);
      setPusherDropResult(`🪙 Pushed 12 coins off the shelf (+${reward} pts)!`);
      soundSynth.play('victory');
    } else {
      setPusherDropResult('🪙 Coin dropped into the lower tray without tipping any shelf coins.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Game Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => setActiveGame('slots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGame === 'slots'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Vegas Slots</span>
        </button>

        <button
          onClick={() => setActiveGame('boss')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGame === 'boss'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Skull className="w-4 h-4" />
          <span>Boss Raids</span>
          {isBossActive && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveGame('heist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGame === 'heist'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Bank Heist</span>
        </button>

        <button
          onClick={() => setActiveGame('duel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGame === 'duel'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>1v1 Duel Arena</span>
        </button>

        <button
          onClick={() => setActiveGame('coinpush')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeGame === 'coinpush'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Coin Pusher</span>
        </button>

        <div className="ml-auto">
          <button
            onClick={() => setActiveGame('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeGame === 'settings'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Payout Sliders & OBS Config</span>
          </button>
        </div>
      </div>

      {/* 1. SLOTS GAME VIEW */}
      {activeGame === 'slots' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                Vegas Triple-7 Slot Machine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chatters trigger with <span className="font-mono text-purple-300">!slots [amount]</span>. Payouts scale dynamically from your configured sliders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Current Payout:</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                {settings.slotsWinMultiplier}x Normal • {settings.slotsJackpotMultiplier}x Jackpot
              </span>
            </div>
          </div>

          {/* Slot Reels Stage */}
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-6">
            <div className="flex items-center gap-4 sm:gap-6 bg-black/60 p-5 rounded-2xl border-2 border-purple-500/60 shadow-inner">
              {reels.map((symbol, idx) => (
                <div
                  key={idx}
                  className={`w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-b from-slate-900 to-black border-2 border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ${
                    isSpinning ? 'animate-bounce' : ''
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>

            {slotMessage && (
              <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-500/50 text-white text-xs font-bold text-center max-w-md animate-in zoom-in-95">
                {slotMessage}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-400">Bet:</span>
                <input
                  type="number"
                  value={slotBet}
                  onChange={(e) => setSlotBet(Math.max(10, parseInt(e.target.value, 10) || 10))}
                  className="w-20 bg-transparent text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={handleSpinSlots}
                disabled={isSpinning}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? 'SPINNING...' : 'SPIN REELS (TEST)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOSS RAID VIEW (Persistent Health Bar + Failure Effects) */}
      {activeGame === 'boss' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                Stream Boss Raid Arena
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Health bar stays on OBS overlay until boss is defeated or time runs out. If timer expires, the screen triggers the boss's custom failure attack!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Boss:</span>
              <select
                value={selectedBossIndex}
                onChange={(e) => handleStartBoss(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-bold focus:outline-none"
              >
                {bossList.map((b, idx) => (
                  <option key={b.id} value={idx}>
                    {b.icon} {b.name} ({b.maxHp.toLocaleString()} HP • {b.failureEffect})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Boss Arena Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-red-950/30 to-slate-950 border-2 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-red-600/40">
                  {currentBoss.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{currentBoss.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase">
                      {currentBoss.failureEffect} Attack
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">{currentBoss.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic">"{currentBoss.introQuote}"</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono ${
                  bossTimer <= 15 ? 'bg-red-600 text-white animate-pulse border-red-400' : 'bg-black/60 text-red-300 border-red-500/40'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-lg font-black">{bossTimer}s</span>
                </div>

                {!isBossActive ? (
                  <button
                    onClick={() => handleStartBoss(selectedBossIndex)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 transition-all cursor-pointer"
                  >
                    SPAWN BOSS RAID
                  </button>
                ) : (
                  <button
                    onClick={() => handleAttackBoss('PixelKnight')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-red-600/40 transition-all cursor-pointer active:scale-95"
                  >
                    ⚔️ CHAT ATTACK (-1.5k)
                  </button>
                )}
              </div>
            </div>

            {/* Persistent HP Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Raid Boss Vitality:</span>
                <span className="text-red-400 font-black">
                  {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP (
                  {Math.max(0, Math.min(100, Math.round((bossHp / bossMaxHp) * 100)))}%)
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                  style={{ width: `${Math.max(0, Math.min(100, (bossHp / bossMaxHp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Raid Attack Log */}
            <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-300 space-y-1 max-h-36 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans font-bold">
                Live Raid Battle Log:
              </div>
              {bossLog.length > 0 ? (
                bossLog.map((log, idx) => <div key={idx}>{log}</div>)
              ) : (
                <div className="text-slate-500 italic">Click Spawn Boss Raid or chat !attack to begin raid!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. HEIST GAME VIEW */}
      {activeGame === 'heist' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                Community Bank Heist
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chatters type <span className="font-mono text-orange-300">!heist [amount]</span> to join the heist crew. Successful getaways unlock the "Vault Breached" achievement!
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold">
              Vault: 12,800 pts • {settings.heistSuccessRatePercent}% Base Success
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-orange-950/30 to-slate-950 border-2 border-orange-500/40 space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-5xl shadow-2xl shadow-orange-600/40">
              🏦
            </div>

            {heistMessage && (
              <div className="p-3 rounded-xl bg-orange-900/40 border border-orange-500/50 text-white text-xs font-bold text-center max-w-md animate-in zoom-in-95">
                {heistMessage}
              </div>
            )}

            <button
              onClick={handleRunHeist}
              disabled={heistStatus === 'running'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-600/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {heistStatus === 'running' ? 'CRACKING VAULT...' : 'COMMENCE HEIST (TEST)'}
            </button>
          </div>
        </div>
      )}

      {/* 4. DUEL ARENA VIEW */}
      {activeGame === 'duel' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-400" />
              1v1 High Noon Duel Arena
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chatters challenge with <span className="font-mono text-cyan-300">!duel @username [bet]</span>. Winner takes the purse!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-slate-950 border border-cyan-500/30">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
              <label className="text-xs text-slate-400 font-bold">Challenger 1:</label>
              <input
                type="text"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
              <label className="text-xs text-slate-400 font-bold">Challenger 2:</label>
              <input
                type="text"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleRunDuel}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/40 transition-all cursor-pointer active:scale-95"
            >
              RUN DUEL SHOOTOUT (TEST)
            </button>
          </div>
        </div>
      )}

      {/* 5. COIN PUSHER VIEW */}
      {activeGame === 'coinpush' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Coin Pusher Arcade Shelf
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chatters drop coins with <span className="font-mono text-amber-300">!drop</span> to tip the shelf!
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-amber-950/30 to-slate-950 border border-amber-500/30 space-y-4">
            <div className="text-5xl">🪙🪙🪙</div>
            {pusherDropResult && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold text-center">
                {pusherDropResult}
              </div>
            )}
            <button
              onClick={handleDropCoin}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/40 transition-all cursor-pointer"
            >
              DROP COIN (TEST)
            </button>
          </div>
        </div>
      )}

      {/* 6. PAYOUT SLIDERS & OBS CONFIGURATION */}
      {activeGame === 'settings' && (
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Chat Games Payout Sliders & Live OBS Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust game multipliers, probabilities, and the 4-7 second OBS alert preview duration. All settings persist between streams automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Auto-Saved to Local Storage</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. OBS Overlay Duration Slider (4-7 seconds requested) */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  OBS Alert Preview Duration:
                </span>
                <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.previewDurationSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="7"
                step="1"
                value={settings.previewDurationSeconds}
                onChange={(e) => updateSettings({ previewDurationSeconds: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>4s (Snappy)</span>
                <span>5s (Balanced)</span>
                <span>6s (Recommended)</span>
                <span>7s (Cinematic)</span>
              </div>
            </div>

            {/* 2. Slots Win Multiplier Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Slots Regular Win Multiplier:</span>
                <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.slotsWinMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.1"
                value={settings.slotsWinMultiplier}
                onChange={(e) => updateSettings({ slotsWinMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.5x</span>
                <span>2.5x</span>
                <span>5.0x</span>
              </div>
            </div>

            {/* 3. Slots Jackpot Multiplier Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Slots Triple-7 Jackpot Multiplier:</span>
                <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.slotsJackpotMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={settings.slotsJackpotMultiplier}
                onChange={(e) => updateSettings({ slotsJackpotMultiplier: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5x</span>
                <span>20x</span>
                <span>50x</span>
              </div>
            </div>

            {/* 4. Slots Win Chance % */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Slots Overall Win Probability:</span>
                <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.slotsWinChance}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="1"
                value={settings.slotsWinChance}
                onChange={(e) => updateSettings({ slotsWinChance: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Hard)</span>
                <span>40% (Medium)</span>
                <span>70% (Generous)</span>
              </div>
            </div>

            {/* 5. Heist Success Rate % */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Heist Crew Success Rate:</span>
                <span className="text-xs font-mono font-black text-orange-400 bg-orange-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.heistSuccessRate}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                step="1"
                value={settings.heistSuccessRate}
                onChange={(e) => updateSettings({ heistSuccessRate: parseInt(e.target.value, 10) })}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20%</span>
                <span>50%</span>
                <span>85%</span>
              </div>
            </div>

            {/* 6. Heist Vault Multiplier */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Heist Vault Multiplier:</span>
                <span className="text-xs font-mono font-black text-orange-400 bg-orange-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.heistVaultMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="10.0"
                step="0.5"
                value={settings.heistVaultMultiplier}
                onChange={(e) => updateSettings({ heistVaultMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.5x</span>
                <span>5.0x</span>
                <span>10.0x</span>
              </div>
            </div>

            {/* 7. Duel Purse Multiplier */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Duel Purse Multiplier:</span>
                <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.duelPurseMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.0"
                step="0.1"
                value={settings.duelPurseMultiplier}
                onChange={(e) => updateSettings({ duelPurseMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.5x</span>
                <span>2.0x</span>
                <span>3.0x</span>
              </div>
            </div>

            {/* 8. Coin Pusher Jackpot Multiplier */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Coin Pusher Avalanche Multiplier:</span>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {settings.coinPusherJackpotMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="20.0"
                step="0.5"
                value={settings.coinPusherJackpotMultiplier}
                onChange={(e) => updateSettings({ coinPusherJackpotMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2x</span>
                <span>10x</span>
                <span>20x</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
