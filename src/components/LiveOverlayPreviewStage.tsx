import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Volume2,
  Maximize2,
  RotateCcw,
  Layers,
  Palette,
  Trophy,
  Gift,
  Flame,
  Award,
  Radio,
  Sliders,
  CheckCircle2,
  Eye,
  X,
  Video,
  Image as ImageIcon,
  Film,
  Swords,
  Coins,
  ShieldAlert,
  Zap,
  Snowflake,
  Skull
} from 'lucide-react';
import { ShoutoutConfig, AchievementItem, RedeemItem, BossItem, BossFailureEffect, MassDropPreset } from '../types';
import { soundSynth } from '../services/soundSynthesizer';
import { DEFAULT_BOSSES } from '../data/defaultData';

export interface OverlayEventData {
  id: string;
  type: 'achievement' | 'shoutout' | 'confetti' | 'cookies' | 'mass_drop' | 'redeem' | 'game' | 'slots' | 'heist' | 'duel' | 'coinpush' | 'boss_attack' | 'boss_failure' | 'boss_defeat' | 'custom' | 'media_video' | 'media_gif' | 'video' | 'gif';
  title?: string;
  subtitle?: string;
  description?: string;
  username?: string;
  points?: number;
  gamerscore?: number;
  trophyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon?: string;
  theme?: 'neon-cyber' | 'retro-synth' | 'clean-dark' | 'gold-royal';
  preset?: 'xbox' | 'playstation' | 'steam' | 'generic';
  duration?: number;
  timestamp: number;
  gameType?: 'slots' | 'heist' | 'duel' | 'coinpush';
  payoutAmount?: number;
  mediaType?: 'video' | 'gif' | 'image';
  mediaUrl?: string;
  videoUrl?: string;
  gifUrl?: string;
  mediaFit?: 'contain' | 'cover' | 'original';
  mediaPosition?: 'center' | 'fullscreen' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  mediaVolume?: number;
  chromaKey?: 'none' | 'green' | 'blue' | 'magenta' | 'black';
  caption?: string;
  soundPreset?: string;
  dropPreset?: MassDropPreset;
  customDropImageUrl?: string;
  dropParticleCount?: number;
  bossFailureEffect?: BossFailureEffect;
  bossName?: string;
  currentHp?: number;
  maxHp?: number;
  remainingSeconds?: number;
}

interface LiveOverlayPreviewStageProps {
  shoutoutConfig?: ShoutoutConfig;
  initialEvent?: OverlayEventData | null;
  isCompact?: boolean;
  onClose?: () => void;
}

export const LiveOverlayPreviewStage: React.FC<LiveOverlayPreviewStageProps> = ({
  shoutoutConfig,
  initialEvent,
  isCompact = false,
  onClose
}) => {
  const [activeEvents, setActiveEvents] = useState<OverlayEventData[]>([]);
  const [testUsername, setTestUsername] = useState('PixelKnight');
  const [testTitle, setTestTitle] = useState('First Contact');
  const [testMessage, setTestMessage] = useState('Send your very first message in the stream chat.');
  const [selectedTheme, setSelectedTheme] = useState<'neon-cyber' | 'retro-synth' | 'clean-dark' | 'gold-royal'>(
    shoutoutConfig?.overlayTheme || 'neon-cyber'
  );
  const [selectedPreset, setSelectedPreset] = useState<'xbox' | 'playstation' | 'steam' | 'generic'>('xbox');
  const [particlesActive, setParticlesActive] = useState(false);
  const [cookieRainActive, setCookieRainActive] = useState(false);
  const [massDropActive, setMassDropActive] = useState(false);
  const [activeMassDropPreset, setActiveMassDropPreset] = useState<MassDropPreset>('coins');
  const [activeCustomDropImage, setActiveCustomDropImage] = useState<string | undefined>(undefined);
  const [activeDropParticleCount, setActiveDropParticleCount] = useState<number>(75);
  const customImgRef = useRef<HTMLImageElement | null>(null);

  // Boss HUD State
  const [activeBoss, setActiveBoss] = useState<BossItem | null>(null);
  const [bossHp, setBossHp] = useState<number>(10000);
  const [bossMaxHp, setBossMaxHp] = useState<number>(10000);
  const [bossRemainingSeconds, setBossRemainingSeconds] = useState<number>(60);
  const [activeFailureEffect, setActiveFailureEffect] = useState<{
    effect: BossFailureEffect;
    title: string;
    subtitle: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial event if triggered from outside
  useEffect(() => {
    if (initialEvent) {
      triggerEvent(initialEvent);
    }
  }, [initialEvent]);

  // Boss Countdown Timer Simulation when active
  useEffect(() => {
    if (!activeBoss) return;
    const timer = setInterval(() => {
      setBossRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger failure effect when timer hits 0!
          triggerBossFailure(activeBoss);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeBoss]);

  // Particle Canvas Physics System (Confetti, Cookies, Coins, Bills, Cats, Dogs, Gems, Tacos, Custom)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      type: 'confetti' | 'cookie' | 'coin' | 'bill' | 'cat' | 'dog' | 'gem' | 'taco' | 'star' | 'gift' | 'rocket' | 'custom';
      emoji?: string;
      life: number;
    }> = [];

    if (particlesActive) {
      const colors = ['#a855f7', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#3b82f6', '#ef4444'];
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.3),
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 3 + 2,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          type: 'confetti',
          life: 1
        });
      }
    }

    if (cookieRainActive) {
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -Math.random() * 200,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 4 + 3,
          size: 24,
          color: '#d97706',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1,
          type: 'cookie',
          emoji: '🍪',
          life: 1
        });
      }
    }

    if (massDropActive) {
      const count = activeDropParticleCount || 75;
      const catEmojis = ['🐱', '🐈', '😻', '😸', '🐾'];
      const dogEmojis = ['🐶', '🐕', '🐩', '🦮', '🐾'];
      const billEmojis = ['💵', '💸', '🤑', '💶'];
      const coinEmojis = ['🪙', '💰', '✨', '🟡'];
      const gemEmojis = ['💎', '✨', '🔷', '💠'];
      const tacoEmojis = ['🌮', '🌯', '🥑', '🌶️'];
      const starEmojis = ['⭐', '🌟', '✨', '💫'];
      const giftEmojis = ['🎁', '📦', '🎀', '🎉'];
      const rocketEmojis = ['🚀', '💥', '🔥', '✨'];

      // Preload custom image if requested
      if (activeMassDropPreset === 'custom' && activeCustomDropImage) {
        const img = new Image();
        img.src = activeCustomDropImage;
        customImgRef.current = img;
      }

      for (let i = 0; i < count; i++) {
        let chosenType: any = activeMassDropPreset;
        let chosenEmoji = '🪙';

        if (activeMassDropPreset === 'cookies') {
          chosenEmoji = '🍪';
        } else if (activeMassDropPreset === 'coins') {
          chosenEmoji = coinEmojis[Math.floor(Math.random() * coinEmojis.length)];
        } else if (activeMassDropPreset === 'bills') {
          chosenEmoji = billEmojis[Math.floor(Math.random() * billEmojis.length)];
        } else if (activeMassDropPreset === 'cats') {
          chosenEmoji = catEmojis[Math.floor(Math.random() * catEmojis.length)];
        } else if (activeMassDropPreset === 'dogs') {
          chosenEmoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];
        } else if (activeMassDropPreset === 'gems') {
          chosenEmoji = gemEmojis[Math.floor(Math.random() * gemEmojis.length)];
        } else if (activeMassDropPreset === 'tacos') {
          chosenEmoji = tacoEmojis[Math.floor(Math.random() * tacoEmojis.length)];
        } else if (activeMassDropPreset === 'stars') {
          chosenEmoji = starEmojis[Math.floor(Math.random() * starEmojis.length)];
        } else if (activeMassDropPreset === 'gifts') {
          chosenEmoji = giftEmojis[Math.floor(Math.random() * giftEmojis.length)];
        } else if (activeMassDropPreset === 'rockets') {
          chosenEmoji = rocketEmojis[Math.floor(Math.random() * rocketEmojis.length)];
        }

        particles.push({
          x: Math.random() * canvas.width,
          y: -Math.random() * 350,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 4 + 2.5,
          size: activeMassDropPreset === 'custom' ? 36 : Math.floor(Math.random() * 10 + 22),
          color: '#fbbf24',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
          type: chosenType,
          emoji: chosenEmoji,
          life: 1
        });
      }
    }

    let isRunning = particlesActive || cookieRainActive || massDropActive;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.vy += 0.04; // gravity

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'custom' && customImgRef.current && customImgRef.current.complete) {
          try {
            ctx.drawImage(
              customImgRef.current,
              -p.size / 2,
              -p.size / 2,
              p.size,
              p.size
            );
          } catch {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🖼️', 0, 0);
          }
        } else if (p.type === 'confetti') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji || '🪙', 0, 0);
        }
        ctx.restore();

        if (p.y > canvas.height + 60) {
          particles.splice(i, 1);
          i--;
        }
      }

      if (particles.length > 0 && isRunning) {
        animId = requestAnimationFrame(render);
      }
    };

    if (isRunning) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [particlesActive, cookieRainActive, massDropActive, activeMassDropPreset, activeCustomDropImage, activeDropParticleCount]);

  const triggerEvent = (event: OverlayEventData) => {
    setActiveEvents((prev) => [...prev, event]);

    // Play synthesized audio tone
    if (event.preset === 'xbox' || event.soundPreset === 'xbox') {
      soundSynth.play('xbox_chime');
    } else if (event.preset === 'playstation' || event.soundPreset === 'playstation') {
      soundSynth.play('ps_trophy');
    } else if (event.preset === 'steam' || event.soundPreset === 'steam') {
      soundSynth.play('steam_ding');
    } else if (event.type === 'mass_drop') {
      soundSynth.play('jackpot');
      if (event.dropPreset) setActiveMassDropPreset(event.dropPreset);
      if (event.customDropImageUrl) setActiveCustomDropImage(event.customDropImageUrl);
      if (event.dropParticleCount) setActiveDropParticleCount(event.dropParticleCount);
      setMassDropActive(true);
    } else if (event.soundPreset) {
      soundSynth.play(event.soundPreset);
    } else if (event.type === 'shoutout') {
      soundSynth.play('shoutout');
    } else if (event.type === 'confetti') {
      soundSynth.play('victory');
      setParticlesActive(true);
    } else if (event.type === 'cookies') {
      soundSynth.play('coin');
      setCookieRainActive(true);
    } else {
      soundSynth.play('coin');
    }

    // Broadcast to OBS overlay browser source via BroadcastChannel
    try {
      const channel = new BroadcastChannel('droidos_alerts');
      channel.postMessage(event);
      channel.close();
    } catch {
      // BroadcastChannel unavailable in sandboxed environment
    }

    // Auto remove alert after duration (4-7 seconds)
    const duration = (event.duration || 6) * 1000;
    setTimeout(() => {
      setActiveEvents((prev) => prev.filter((e) => e.id !== event.id));
      if (event.type === 'confetti') setParticlesActive(false);
      if (event.type === 'cookies') setCookieRainActive(false);
      if (event.type === 'mass_drop') setMassDropActive(false);
    }, duration);
  };

  const triggerBossFailure = (boss: BossItem) => {
    setActiveFailureEffect({
      effect: boss.failureEffect,
      title: boss.failureTitle,
      subtitle: boss.failureSubtitle
    });

    if (boss.failureEffect === 'fireball') {
      soundSynth.play('fireball');
    } else if (boss.failureEffect === 'cyber_glitch') {
      soundSynth.play('cyber_glitch');
    } else if (boss.failureEffect === 'freeze_screen') {
      soundSynth.play('freeze_crack');
    } else {
      soundSynth.play('void_collapse');
    }

    // Broadcast failure to OBS
    try {
      const channel = new BroadcastChannel('droidos_alerts');
      channel.postMessage({
        id: `fail-${Date.now()}`,
        type: 'boss_failure',
        bossFailureEffect: boss.failureEffect,
        title: boss.failureTitle,
        subtitle: boss.failureSubtitle,
        durationMs: 7000,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}

    setTimeout(() => {
      setActiveFailureEffect(null);
      setActiveBoss(null);
    }, 7000);
  };

  // Quick Trigger Handlers
  const handleTestXboxAchievement = () => {
    triggerEvent({
      id: `ach-xbox-${Date.now()}`,
      type: 'achievement',
      preset: 'xbox',
      title: testTitle || 'First Contact',
      description: testMessage || 'Send your very first message in the stream chat.',
      username: testUsername || 'PixelKnight',
      points: 500,
      gamerscore: 50,
      duration: 6,
      timestamp: Date.now()
    });
  };

  const handleTestPSAchievement = () => {
    triggerEvent({
      id: `ach-ps-${Date.now()}`,
      type: 'achievement',
      preset: 'playstation',
      title: testTitle || 'High Roller',
      description: testMessage || 'Accumulate over 5,000 DroidCoins in stream wallet.',
      username: testUsername || 'PixelKnight',
      trophyTier: 'gold',
      points: 1000,
      duration: 6,
      timestamp: Date.now()
    });
  };

  const handleTestSteamAchievement = () => {
    triggerEvent({
      id: `ach-steam-${Date.now()}`,
      type: 'achievement',
      preset: 'steam',
      title: testTitle || 'Vault Breached',
      description: testMessage || 'Pull off your very first successful Bank Heist getaway.',
      username: testUsername || 'PixelKnight',
      points: 1000,
      duration: 6,
      timestamp: Date.now()
    });
  };

  const handleTestSlotsPreview = () => {
    triggerEvent({
      id: `game-slots-${Date.now()}`,
      type: 'slots',
      gameType: 'slots',
      title: '🎰 7-7-7 TRIPLE JACKPOT!',
      subtitle: `@${testUsername} lined up 3 Gold Sevens!`,
      username: testUsername,
      payoutAmount: 2500,
      duration: 5,
      timestamp: Date.now()
    });
  };

  const handleTestHeistPreview = () => {
    triggerEvent({
      id: `game-heist-${Date.now()}`,
      type: 'heist',
      gameType: 'heist',
      title: '🏦 BANK VAULT CRACKED!',
      subtitle: `@${testUsername} & crew breached the central vault!`,
      username: testUsername,
      payoutAmount: 3500,
      duration: 6,
      timestamp: Date.now()
    });
  };

  const handleTestDuelPreview = () => {
    triggerEvent({
      id: `game-duel-${Date.now()}`,
      type: 'duel',
      gameType: 'duel',
      title: '⚔️ QUICKDRAW VICTORY!',
      subtitle: `@${testUsername} won the 1v1 High Noon shootout!`,
      username: testUsername,
      payoutAmount: 1200,
      duration: 5,
      timestamp: Date.now()
    });
  };

  const handleTestCoinPusherPreview = () => {
    triggerEvent({
      id: `game-coin-${Date.now()}`,
      type: 'coinpush',
      gameType: 'coinpush',
      title: '🪙 COIN AVALANCHE!',
      subtitle: `@${testUsername} tipped 42 tokens off the shelf!`,
      username: testUsername,
      payoutAmount: 1800,
      duration: 5,
      timestamp: Date.now()
    });
  };

  const handleStartBoss = (bossIndex: number) => {
    const selected = DEFAULT_BOSSES[bossIndex];
    setActiveBoss(selected);
    setBossHp(selected.maxHp);
    setBossMaxHp(selected.maxHp);
    setBossRemainingSeconds(selected.timerSeconds);
    soundSynth.play('laser');

    // Broadcast Boss HUD active to OBS
    try {
      const channel = new BroadcastChannel('droidos_alerts');
      channel.postMessage({
        id: `boss-start-${Date.now()}`,
        type: 'boss_attack',
        bossName: selected.name,
        subtitle: selected.title,
        icon: selected.icon,
        currentHp: selected.maxHp,
        maxHp: selected.maxHp,
        remainingSeconds: selected.timerSeconds,
        timestamp: Date.now()
      });
      channel.close();
    } catch {}
  };

  const handleAttackBoss = () => {
    if (!activeBoss) return;
    const dmg = 1500;
    const newHp = Math.max(0, bossHp - dmg);
    setBossHp(newHp);
    soundSynth.play('laser');

    if (newHp === 0) {
      soundSynth.play('boss_defeat');
      // Unlock achievement
      triggerEvent({
        id: `ach-boss-${Date.now()}`,
        type: 'achievement',
        preset: 'xbox',
        title: activeBoss.name + ' Defeated',
        description: `Chat dealt the final blow and saved the stream!`,
        username: testUsername,
        gamerscore: 150,
        points: activeBoss.rewardPoints,
        duration: 7,
        timestamp: Date.now()
      });
      setActiveBoss(null);
    }
  };

  const handleClearStage = () => {
    setActiveEvents([]);
    setActiveFailureEffect(null);
    setActiveBoss(null);
    setParticlesActive(false);
    setCookieRainActive(false);
  };

  return (
    <div className="space-y-4">
      {/* Live Stage Frame */}
      <div className="relative rounded-2xl bg-black/95 border border-purple-500/30 overflow-hidden shadow-2xl aspect-video w-full flex flex-col justify-between p-4 sm:p-6 group select-none">
        {/* Fake Stream Game Background Mockup */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#070d1e] to-purple-950/40 opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

        {/* Fullscreen Boss Failure Canvas Effect Overlay */}
        {activeFailureEffect && (
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300 ${
              activeFailureEffect.effect === 'fireball'
                ? 'bg-gradient-to-b from-red-600/90 via-orange-600/85 to-black/95 border-8 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.9)] animate-pulse'
                : activeFailureEffect.effect === 'cyber_glitch'
                ? 'bg-gradient-to-b from-cyan-950/90 via-purple-950/90 to-black/95 border-8 border-cyan-400 shadow-[0_0_80px_rgba(6,182,212,0.9)] backdrop-filter invert-[0.1]'
                : activeFailureEffect.effect === 'freeze_screen'
                ? 'bg-gradient-to-b from-blue-500/80 via-cyan-600/80 to-slate-950/95 border-8 border-blue-200 shadow-[0_0_80px_rgba(147,197,253,0.9)] backdrop-blur-md'
                : 'bg-gradient-to-b from-purple-950/95 via-indigo-950/95 to-black border-8 border-purple-600 shadow-[0_0_80px_rgba(168,85,247,0.9)]'
            }`}
          >
            <div className="text-6xl mb-3 animate-bounce">
              {activeFailureEffect.effect === 'fireball' ? '🔥' : activeFailureEffect.effect === 'cyber_glitch' ? '👾' : activeFailureEffect.effect === 'freeze_screen' ? '❄️' : '🌌'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-mono tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {activeFailureEffect.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-100 font-bold max-w-lg mt-2 drop-shadow-md">
              {activeFailureEffect.subtitle}
            </p>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-mono text-white">
              SCREEN EFFECT PERSISTS UNTIL CLEARED (OR 7s)
            </div>
          </div>
        )}

        {/* Particles Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Stream Watermark / Live Badge */}
        <div className="relative z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-red-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE OBS STAGE PREVIEW (1080p)
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
              1920x1080 • Active Sync
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleClearStage}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Stage</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Persistent Top Boss Bar HUD (when active) */}
        {activeBoss && (
          <div className="relative z-40 max-w-xl mx-auto w-full p-3 rounded-2xl bg-slate-950/95 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center border border-red-500/50 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(activeBoss.name)}&colors=amber,blue,cyan,green,indigo,lime,orange,pink,purple,red,teal,yellow`} className="w-full h-full object-cover" alt="boss" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{activeBoss.name}</div>
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{activeBoss.title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-1 rounded-full font-mono text-xs font-black flex items-center gap-1.5 ${
                  bossRemainingSeconds <= 15 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  <span>⏱️</span>
                  <span>{bossRemainingSeconds}s</span>
                </div>

                <button
                  onClick={handleAttackBoss}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer shadow-md pointer-events-auto"
                >
                  ⚔️ Attack (-1.5k)
                </button>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                style={{ width: `${Math.max(0, Math.min(100, Math.round((bossHp / bossMaxHp) * 100)))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} HP</span>
              <span>{Math.round((bossHp / bossMaxHp) * 100)}%</span>
            </div>
          </div>
        )}

        {/* Center / Bottom Overlay Layer */}
        <div className="relative z-30 flex-1 flex flex-col justify-end items-start pointer-events-none py-2 w-full">
          {activeEvents.map((evt) => {
            // 1. Xbox Achievement Banner
            if (evt.type === 'achievement' && evt.preset === 'xbox') {
              return (
                <div
                  key={evt.id}
                  className="animate-in slide-in-from-bottom-8 duration-500 max-w-sm w-full p-3 rounded-xl bg-[#1a1a1a]/98 border border-[#333333] shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-full bg-[#107C10] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,124,16,0.5)]">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white/90">Achievement unlocked</span>
                      <span className="text-[12px] font-bold text-white/90 flex items-center gap-0.5">
                        <span className="text-[10px]">G</span>{evt.gamerscore || 50}
                      </span>
                    </div>
                    <div className="text-[15px] font-bold text-white truncate leading-tight">
                      {evt.title}
                    </div>
                  </div>
                </div>
              );
            }

            // 2. PlayStation Trophy Banner
            if (evt.type === 'achievement' && evt.preset === 'playstation') {
              return (
                <div
                  key={evt.id}
                  className="animate-in slide-in-from-top-8 duration-500 max-w-[320px] w-full bg-[#1b1b1b]/95 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center gap-3 relative"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-white"></div>
                  <div className="w-16 h-16 bg-transparent flex items-center justify-center shrink-0 pl-2">
                    {evt.trophyTier === 'platinum' ? (
                      <span className="text-3xl drop-shadow-[0_0_10px_rgba(200,200,255,0.8)]">🏆</span>
                    ) : evt.trophyTier === 'gold' ? (
                      <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">🏆</span>
                    ) : evt.trophyTier === 'silver' ? (
                      <span className="text-3xl grayscale brightness-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">🏆</span>
                    ) : (
                      <span className="text-3xl sepia-[0.8] hue-rotate-[-30deg] saturate-[1.5] brightness-75 drop-shadow-[0_0_5px_rgba(205,127,50,0.5)]">🏆</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-3 pr-4">
                    <div className="text-[14px] text-white/90 truncate leading-tight">
                      You have earned a trophy!
                    </div>
                    <div className="text-[16px] font-semibold text-white truncate leading-snug">
                      {evt.title}
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Steam Achievement Banner
            if (evt.type === 'achievement') {
              return (
                <div
                  key={evt.id}
                  className="animate-in slide-in-from-left-6 duration-300 max-w-md w-full p-3.5 rounded-xl bg-gradient-to-r from-[#171d25]/98 to-[#10141b]/98 border-2 border-[#66c0f4]/80 shadow-[0_0_30px_rgba(102,192,244,0.4)] backdrop-blur-2xl flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#1b2838] border border-[#66c0f4]/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    ⭐
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black tracking-wider uppercase text-[#66c0f4]">
                      STEAM ACHIEVEMENT UNLOCKED
                    </div>
                    <div className="text-sm font-extrabold text-white truncate">
                      {evt.username || testUsername} has unlocked an achievement: {evt.title}
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      +{evt.points || 500} pts {evt.description ? `• ${evt.description}` : ''}
                    </div>
                  </div>
                </div>
              );
            }

            // 4. Chat Games Live Previews (Slots, Heist, Duel, Coin Pusher)
            if (evt.type === 'slots' || evt.type === 'heist' || evt.type === 'duel' || evt.type === 'coinpush' || evt.type === 'game') {
              const gameType = evt.gameType || evt.type;
              return (
                <div
                  key={evt.id}
                  className={`animate-in zoom-in-95 duration-300 max-w-md w-full p-4 rounded-2xl backdrop-blur-2xl shadow-2xl flex flex-col gap-2.5 border-2 ${
                    gameType === 'slots'
                      ? 'bg-purple-950/95 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.4)]'
                      : gameType === 'heist'
                      ? 'bg-orange-950/95 border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.4)]'
                      : gameType === 'duel'
                      ? 'bg-cyan-950/95 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                      : 'bg-amber-950/95 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-xs">
                    <span className="font-mono font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                      {gameType === 'slots' ? '🎰 VEGAS SLOTS' : gameType === 'heist' ? '🏦 BANK HEIST' : gameType === 'duel' ? '⚔️ 1v1 DUEL' : '🪙 COIN PUSHER'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">@{evt.username || testUsername}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-2 bg-black/40 rounded-xl text-3xl">
                    {gameType === 'slots' ? (
                      <><span>7️⃣</span><span>💎</span><span>🍒</span></>
                    ) : gameType === 'heist' ? (
                      <><span>💼</span><span>💰</span><span>🏎️</span></>
                    ) : gameType === 'duel' ? (
                      <><span>🤠</span><span>💥</span><span>🎯</span></>
                    ) : (
                      <><span>🪙</span><span>💰</span><span>✨</span></>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{evt.title}</span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">+{evt.payoutAmount || 1500} pts</span>
                  </div>
                </div>
              );
            }

            // 5. Mass Airdrop Celebratory Banner
            if (evt.type === 'mass_drop') {
              const presetIcons: Record<string, string> = {
                cookies: '🍪',
                coins: '🪙',
                bills: '💵',
                cats: '🐱',
                dogs: '🐶',
                gems: '💎',
                tacos: '🌮',
                stars: '⭐',
                gifts: '🎁',
                rockets: '🚀',
                custom: '✨'
              };
              const dropIcon = presetIcons[evt.dropPreset || 'coins'] || '🪙';

              return (
                <div
                  key={evt.id}
                  className="animate-in zoom-in-95 duration-300 max-w-lg w-full p-4 rounded-2xl bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-slate-950/95 border-2 border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.5)] backdrop-blur-2xl flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl border-2 border-white/40 shrink-0 animate-bounce">
                    {dropIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
                        🎉 MASS AIRDROP ACTIVATED
                      </span>
                      <span className="text-[10px] font-mono font-bold text-pink-300">
                        {evt.dropPreset?.toUpperCase() || 'COINS'}
                      </span>
                    </div>
                    <div className="text-base font-black text-white truncate mt-0.5">
                      {evt.title || 'Mass Points Dropped to All Viewers!'}
                    </div>
                    <div className="text-xs text-purple-200 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                      <span>+{evt.points || 500} pts to every active chatter in the stream</span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {activeEvents.length === 0 && !activeBoss && !activeFailureEffect && (
            <div className="text-center space-y-1 text-slate-500 opacity-60 w-full py-8">
              <Eye className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs font-semibold">Overlay Stage Idle</p>
              <p className="text-[10px]">Trigger any console achievement, chat game preview, or raid boss below</p>
            </div>
          )}
        </div>

        {/* Bottom Control Pill */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Console Banners (Xbox / PS / Steam) & 4-7s Chat Games Engine</span>
          </span>
          <span>WebSocket v5 + BroadcastChannel Active</span>
        </div>
      </div>

      {/* Interactive Trigger Control Hub */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Console Achievements & Chat Game Live Triggers
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Banner Preset:</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs font-semibold focus:outline-none"
            >
              <option value="xbox" className="bg-slate-900 text-white">Xbox Achievement (+50G)</option>
              <option value="playstation" className="bg-slate-900 text-white">PlayStation Trophy (Gold/Plat)</option>
              <option value="steam" className="bg-slate-900 text-white">Steam Achievement (Cyan)</option>
            </select>
          </div>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            onClick={handleTestXboxAchievement}
            className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Xbox Banner</span>
          </button>

          <button
            onClick={handleTestPSAchievement}
            className="p-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Trophy className="w-4 h-4 text-blue-400" />
            <span>PS Trophy</span>
          </button>

          <button
            onClick={handleTestSteamAchievement}
            className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Steam Banner</span>
          </button>

          <button
            onClick={handleTestSlotsPreview}
            className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Slots Preview</span>
          </button>

          <button
            onClick={handleTestHeistPreview}
            className="p-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>Heist Preview</span>
          </button>

          <button
            onClick={handleTestDuelPreview}
            className="p-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Swords className="w-4 h-4 text-teal-400" />
            <span>Duel Preview</span>
          </button>

          <button
            onClick={handleTestCoinPusherPreview}
            className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Coin Pusher</span>
          </button>
        </div>

        {/* Mass Drop Presets Tester Row */}
        <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-purple-400" />
              Mass Drop Fullscreen Overlay Presets
            </span>
            <span className="text-[10px] text-slate-400">Stream-wide reward animation presets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <button
              onClick={() => triggerEvent({
                id: `md-coins-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'coins',
                title: 'Mass Coins Airdrop',
                points: 500,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-left text-xs text-amber-200 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">🪙</span>
              <span>Coins Drop</span>
            </button>

            <button
              onClick={() => triggerEvent({
                id: `md-cookies-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'cookies',
                title: 'Cookie Monster Rain',
                points: 250,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-amber-700/20 hover:bg-amber-700/30 border border-amber-700/40 text-left text-xs text-amber-100 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">🍪</span>
              <span>Cookie Rain</span>
            </button>

            <button
              onClick={() => triggerEvent({
                id: `md-bills-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'bills',
                title: 'Make It Rain Money',
                points: 1000,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-left text-xs text-emerald-200 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">💵</span>
              <span>Dollar Bills</span>
            </button>

            <button
              onClick={() => triggerEvent({
                id: `md-cats-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'cats',
                title: 'Kitty Shower',
                points: 300,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-left text-xs text-pink-200 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">🐱</span>
              <span>Cats & Kittens</span>
            </button>

            <button
              onClick={() => triggerEvent({
                id: `md-dogs-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'dogs',
                title: 'Puppy Avalanche',
                points: 300,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-left text-xs text-indigo-200 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">🐶</span>
              <span>Puppy Rain</span>
            </button>

            <button
              onClick={() => triggerEvent({
                id: `md-gems-${Date.now()}`,
                type: 'mass_drop',
                dropPreset: 'gems',
                title: 'Diamond Rush',
                points: 750,
                duration: 6,
                timestamp: Date.now()
              })}
              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-left text-xs text-cyan-200 font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="text-base">💎</span>
              <span>Diamonds & Gems</span>
            </button>
          </div>
        </div>

        {/* Boss Raid Controls Row */}
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-red-400" />
              Boss Raid Simulation & Failure Fullscreen Effects
            </span>
            <span className="text-[10px] text-slate-400">Click boss to trigger persistent HP bar or fail effect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleStartBoss(0)}
              className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-black text-red-300">🐲 Ignis (Fireball FX)</div>
              <div className="text-[10px] text-slate-400">10k HP • 60s timer</div>
            </button>

            <button
              onClick={() => handleStartBoss(1)}
              className="p-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-black text-cyan-300">👾 Glitch-9 (Cyber Glitch)</div>
              <div className="text-[10px] text-slate-400">8k HP • 45s timer</div>
            </button>

            <button
              onClick={() => handleStartBoss(2)}
              className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-black text-blue-300">❄️ Ymir (Freeze Screen)</div>
              <div className="text-[10px] text-slate-400">12k HP • 75s timer</div>
            </button>

            <button
              onClick={() => handleStartBoss(3)}
              className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="font-black text-purple-300">🌌 Leviathan (Void Singularity)</div>
              <div className="text-[10px] text-slate-400">15k HP • 90s timer</div>
            </button>
          </div>
        </div>

        {/* Custom Customizer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Chatter Handle</label>
            <input
              type="text"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              placeholder="PixelKnight"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Achievement / Alert Title</label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-purple-400"
              placeholder="First Contact"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Achievement Description</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-pink-400"
              placeholder="Send your very first message in the stream chat."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
