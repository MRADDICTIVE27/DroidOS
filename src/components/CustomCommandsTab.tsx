import React, { useState, useRef } from 'react';
import {
  Terminal,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  Shield,
  Clock,
  Sparkles,
  Search,
  Check,
  X,
  Play,
  Share2,
  HelpCircle,
  Hash,
  Filter,
  Tag,
  Video,
  Film,
  Image as ImageIcon,
  Layers,
  Tv,
  Coins,
  Flame,
  Trophy,
  Upload,
  Zap,
  Sliders,
  Eye,
  CheckCircle2,
  RotateCcw,
  Gift
} from 'lucide-react';
import { CustomCommand, MassDropPreset, OBSConfig } from '../types';
import { soundSynth } from '../services/soundSynthesizer';
import { DEFAULT_MEDIA_PRESETS } from '../data/defaultData';

interface CustomCommandsTabProps {
  commands: CustomCommand[];
  onAddCommand: (cmd: CustomCommand) => void;
  onUpdateCommand: (cmd: CustomCommand) => void;
  onDeleteCommand: (id: string) => void;
  onToggleCommand: (id: string) => void;
  onTestCommand: (cmd: CustomCommand) => void;
  onTriggerOverlayTest?: (cmd: CustomCommand) => void;
  obsConfig?: OBSConfig;
  currencyName: string;
}

export const CustomCommandsTab: React.FC<CustomCommandsTabProps> = ({
  commands,
  onAddCommand,
  onUpdateCommand,
  onDeleteCommand,
  onToggleCommand,
  onTestCommand,
  onTriggerOverlayTest,
  obsConfig,
  currencyName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [overlayFilter, setOverlayFilter] = useState<'all' | 'with_overlay' | 'without_overlay'>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'overlay'>('general');
  const [editingCommand, setEditingCommand] = useState<CustomCommand | null>(null);

  // Form State - General
  const [cmdTrigger, setCmdTrigger] = useState('');
  const [cmdAliases, setCmdAliases] = useState('');
  const [cmdResponse, setCmdResponse] = useState('');
  const [cmdUserLevel, setCmdUserLevel] = useState<'everyone' | 'subscriber' | 'vip' | 'moderator' | 'owner'>('everyone');
  const [cmdCooldown, setCmdCooldown] = useState<number>(10);
  const [cmdCategory, setCmdCategory] = useState<'general' | 'socials' | 'stream' | 'fun' | 'info'>('general');
  const [cmdSound, setCmdSound] = useState<string>('none');
  const [cmdDesc, setCmdDesc] = useState('');
  const [cmdPointsDelta, setCmdPointsDelta] = useState<number>(0);

  // Form State - Overlay Triggers
  const [triggerOverlay, setTriggerOverlay] = useState<boolean>(false);
  const [overlayType, setOverlayType] = useState<
    'confetti' | 'fireworks' | 'sparkles' | 'mass_drop' | 'banner' | 'shoutout' | 'media_video' | 'media_gif' | 'obs_scene'
  >('fireworks');
  const [overlayTitle, setOverlayTitle] = useState<string>('{user} ACTIVATED HYPE!');
  const [overlaySubtitle, setOverlaySubtitle] = useState<string>('Command trigger received in chat');
  const [overlayDuration, setOverlayDuration] = useState<number>(6);
  const [overlayTheme, setOverlayTheme] = useState<'neon-cyber' | 'retro-synth' | 'clean-dark' | 'gold-royal'>('neon-cyber');
  const [overlayBannerPreset, setOverlayBannerPreset] = useState<'xbox' | 'playstation' | 'steam' | 'generic'>('xbox');
  const [overlayIcon, setOverlayIcon] = useState<string>('🔥');
  const [overlayDropPreset, setOverlayDropPreset] = useState<MassDropPreset>('coins');
  const [customDropImageUrl, setCustomDropImageUrl] = useState<string>('');
  const [dropParticleCount, setDropParticleCount] = useState<number>(75);
  const [mediaType, setMediaType] = useState<'video' | 'gif' | 'image'>('video');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaPosition, setMediaPosition] = useState<'center' | 'fullscreen' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [mediaFit, setMediaFit] = useState<'contain' | 'cover' | 'original'>('contain');
  const [mediaVolume, setMediaVolume] = useState<number>(0.9);
  const [chromaKey, setChromaKey] = useState<'none' | 'green' | 'blue' | 'magenta' | 'black'>('none');
  const [obsSceneToSwitch, setObsSceneToSwitch] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNewModal = () => {
    setEditingCommand(null);
    setModalTab('general');
    setCmdTrigger('');
    setCmdAliases('');
    setCmdResponse('');
    setCmdUserLevel('everyone');
    setCmdCooldown(10);
    setCmdCategory('general');
    setCmdSound('none');
    setCmdDesc('');
    setCmdPointsDelta(0);

    // Overlay resets
    setTriggerOverlay(false);
    setOverlayType('fireworks');
    setOverlayTitle('{user} ACTIVATED HYPE!');
    setOverlaySubtitle('Triggered in broadcast live chat');
    setOverlayDuration(6);
    setOverlayTheme('neon-cyber');
    setOverlayBannerPreset('xbox');
    setOverlayIcon('🔥');
    setOverlayDropPreset('coins');
    setCustomDropImageUrl('');
    setDropParticleCount(75);
    setMediaType('video');
    setMediaUrl('');
    setMediaPosition('center');
    setMediaFit('contain');
    setMediaVolume(0.9);
    setChromaKey('none');
    setObsSceneToSwitch(obsConfig?.scenes?.[0] || '');

    setShowModal(true);
  };

  const openEditModal = (cmd: CustomCommand) => {
    setEditingCommand(cmd);
    setModalTab('general');
    setCmdTrigger(cmd.command);
    setCmdAliases(cmd.aliases.join(', '));
    setCmdResponse(cmd.response);
    setCmdUserLevel(cmd.userLevel);
    setCmdCooldown(cmd.cooldownSeconds);
    setCmdCategory(cmd.category);
    setCmdSound(cmd.soundEffect || 'none');
    setCmdDesc(cmd.description || '');
    setCmdPointsDelta(cmd.pointsRewardOrCost || 0);

    // Overlay state
    setTriggerOverlay(!!cmd.triggerOverlay);
    setOverlayType(cmd.overlayType || 'fireworks');
    setOverlayTitle(cmd.overlayTitle || `${cmd.command.toUpperCase()} ACTIVATED`);
    setOverlaySubtitle(cmd.overlaySubtitle || `Triggered by @{user}`);
    setOverlayDuration(cmd.overlayDurationSeconds || 6);
    setOverlayTheme(cmd.overlayTheme || 'neon-cyber');
    setOverlayBannerPreset(cmd.overlayBannerPreset || 'xbox');
    setOverlayIcon(cmd.overlayIcon || '🔥');
    setOverlayDropPreset(cmd.overlayDropPreset || 'coins');
    setCustomDropImageUrl(cmd.customDropImageUrl || '');
    setDropParticleCount(cmd.dropParticleCount || 75);
    setMediaType(cmd.mediaType || 'video');
    setMediaUrl(cmd.mediaUrl || '');
    setMediaPosition(cmd.mediaPosition || 'center');
    setMediaFit(cmd.mediaFit || 'contain');
    setMediaVolume(cmd.mediaVolume ?? 0.9);
    setChromaKey(cmd.chromaKey || 'none');
    setObsSceneToSwitch(cmd.obsSceneToSwitch || obsConfig?.scenes?.[0] || '');

    setShowModal(true);
  };

  const handleSave = () => {
    if (!cmdTrigger.trim() || !cmdResponse.trim()) return;

    const formattedTrigger = cmdTrigger.trim().startsWith('!') ? cmdTrigger.trim() : `!${cmdTrigger.trim()}`;
    const aliasList = cmdAliases
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0)
      .map((a) => (a.startsWith('!') ? a : `!${a}`));

    const commandData: CustomCommand = {
      id: editingCommand ? editingCommand.id : `cmd-${Date.now()}`,
      command: formattedTrigger,
      aliases: aliasList,
      response: cmdResponse.trim(),
      userLevel: cmdUserLevel,
      cooldownSeconds: cmdCooldown,
      enabled: editingCommand ? editingCommand.enabled : true,
      soundEffect: cmdSound !== 'none' ? cmdSound : undefined,
      useCount: editingCommand ? editingCommand.useCount : 0,
      category: cmdCategory,
      description: cmdDesc.trim() || undefined,
      pointsRewardOrCost: cmdPointsDelta !== 0 ? cmdPointsDelta : undefined,

      // Overlay Configuration
      triggerOverlay: triggerOverlay,
      overlayType: triggerOverlay ? overlayType : undefined,
      overlayTitle: triggerOverlay ? overlayTitle.trim() : undefined,
      overlaySubtitle: triggerOverlay ? overlaySubtitle.trim() : undefined,
      overlayDurationSeconds: triggerOverlay ? overlayDuration : undefined,
      overlayTheme: triggerOverlay ? overlayTheme : undefined,
      overlayBannerPreset: triggerOverlay ? overlayBannerPreset : undefined,
      overlayIcon: triggerOverlay ? overlayIcon : undefined,
      overlayDropPreset: triggerOverlay ? overlayDropPreset : undefined,
      customDropImageUrl: triggerOverlay && customDropImageUrl ? customDropImageUrl : undefined,
      dropParticleCount: triggerOverlay ? dropParticleCount : undefined,
      mediaType: triggerOverlay ? mediaType : undefined,
      mediaUrl: triggerOverlay && mediaUrl ? mediaUrl.trim() : undefined,
      mediaPosition: triggerOverlay ? mediaPosition : undefined,
      mediaFit: triggerOverlay ? mediaFit : undefined,
      mediaVolume: triggerOverlay ? mediaVolume : undefined,
      chromaKey: triggerOverlay ? chromaKey : undefined,
      obsSceneToSwitch: triggerOverlay && obsSceneToSwitch ? obsSceneToSwitch : undefined
    };

    if (editingCommand) {
      onUpdateCommand(commandData);
    } else {
      onAddCommand(commandData);
    }

    setShowModal(false);
  };

  const handleTestCurrentOverlay = () => {
    if (cmdSound !== 'none') {
      soundSynth.play(cmdSound as any);
    }
    if (onTriggerOverlayTest) {
      const mockCmd: CustomCommand = {
        id: 'test-preview',
        command: cmdTrigger || '!test',
        aliases: [],
        response: cmdResponse || 'Test',
        userLevel: cmdUserLevel,
        cooldownSeconds: cmdCooldown,
        enabled: true,
        useCount: 0,
        category: cmdCategory,
        soundEffect: cmdSound !== 'none' ? cmdSound : undefined,
        triggerOverlay: true,
        overlayType,
        overlayTitle,
        overlaySubtitle,
        overlayDurationSeconds: overlayDuration,
        overlayTheme,
        overlayBannerPreset,
        overlayIcon,
        overlayDropPreset,
        customDropImageUrl,
        dropParticleCount,
        mediaType,
        mediaUrl,
        mediaPosition,
        mediaFit,
        mediaVolume,
        chromaKey,
        obsSceneToSwitch
      };
      onTriggerOverlayTest(mockCmd);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (overlayType === 'mass_drop') {
        setCustomDropImageUrl(dataUrl);
        setOverlayDropPreset('custom');
      } else {
        setMediaUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const insertVariable = (varName: string, target: 'response' | 'title' | 'subtitle' = 'response') => {
    if (target === 'response') {
      setCmdResponse((prev) => `${prev} {${varName}}`);
    } else if (target === 'title') {
      setOverlayTitle((prev) => `${prev} {${varName}}`);
    } else if (target === 'subtitle') {
      setOverlaySubtitle((prev) => `${prev} {${varName}}`);
    }
  };

  const filteredCommands = commands.filter((c) => {
    const matchesSearch =
      c.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.response.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;

    const matchesOverlay =
      overlayFilter === 'all'
        ? true
        : overlayFilter === 'with_overlay'
        ? !!c.triggerOverlay
        : !c.triggerOverlay;

    return matchesSearch && matchesCategory && matchesOverlay;
  });

  const availableVariables = [
    { tag: 'user', desc: 'Chatter username who typed the command' },
    { tag: 'target', desc: 'Mentioned user (e.g. !so @User)' },
    { tag: 'points', desc: `Current viewer ${currencyName} balance` },
    { tag: 'watchtime', desc: 'Viewer stream watch minutes' },
    { tag: 'game_name', desc: 'Current category/game title' },
    { tag: 'channel_url', desc: 'Streamer or target YouTube channel URL' },
    { tag: 'uptime', desc: 'Current broadcast live duration' },
    { tag: 'random_user', desc: 'Picks a random active chatter' }
  ];

  const overlayWithCount = commands.filter((c) => c.triggerOverlay).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/20 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Custom Chat Commands</span>
                </h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {commands.length} Total
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {overlayWithCount} with Overlays & OBS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trigger automated chat replies, audio soundboard synthesizers, OBS scene switches, and on-screen particle/video overlays
              </p>
            </div>
          </div>

          <button
            onClick={openNewModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 border border-white/20 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Command</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands, aliases, keywords, overlays, or responses..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/70 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Overlay Filter toggle */}
          <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setOverlayFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                overlayFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setOverlayFilter('with_overlay')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                overlayFilter === 'with_overlay' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Overlays</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'general', 'socials', 'stream', 'fun', 'info'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommands.map((cmd) => {
          const hasOverlay = !!cmd.triggerOverlay;
          const overlayLabel =
            cmd.overlayType === 'fireworks'
              ? '🎆 Fireworks Blast'
              : cmd.overlayType === 'confetti'
              ? '🎊 Confetti Cannon'
              : cmd.overlayType === 'sparkles'
              ? '✨ Sparkles Shower'
              : cmd.overlayType === 'mass_drop'
              ? `🌧️ Mass Drop (${cmd.overlayDropPreset || 'coins'})`
              : cmd.overlayType === 'banner'
              ? `🏆 ${cmd.overlayBannerPreset?.toUpperCase() || 'XBOX'} Banner`
              : cmd.overlayType === 'shoutout'
              ? '🌟 Broadcaster Shoutout'
              : cmd.overlayType === 'media_video'
              ? '🎬 Video Overlay'
              : cmd.overlayType === 'media_gif'
              ? '🖼️ GIF Meme Alert'
              : cmd.overlayType === 'obs_scene'
              ? `📺 OBS: ${cmd.obsSceneToSwitch || 'Scene'}`
              : '✨ Overlay Attached';

          return (
            <div
              key={cmd.id}
              className={`rounded-2xl border p-4.5 backdrop-blur-xl transition-all flex flex-col justify-between space-y-3 relative group ${
                cmd.enabled
                  ? hasOverlay
                    ? 'bg-gradient-to-b from-purple-950/20 to-slate-900/60 border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20'
                    : 'bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10'
                  : 'bg-slate-950/40 border-white/5 opacity-60'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                      {cmd.command}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
                      {cmd.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleCommand(cmd.id)}
                      className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                        cmd.enabled ? 'bg-purple-600' : 'bg-slate-700'
                      }`}
                      title={cmd.enabled ? 'Disable Command' : 'Enable Command'}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                          cmd.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Aliases */}
                {cmd.aliases.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    <span className="text-[10px] text-slate-500">Aliases:</span>
                    {cmd.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="text-[10px] font-mono text-cyan-300/80 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overlay Badge if active */}
                {hasOverlay && (
                  <div className="mb-2 flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{overlayLabel}</span>
                    </div>
                    {onTriggerOverlayTest && (
                      <button
                        onClick={() => onTriggerOverlayTest(cmd)}
                        className="px-2 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-[10px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        title="Preview this overlay on stage"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 font-sans leading-relaxed break-words">
                  {cmd.response}
                </p>
              </div>

              {/* Footer details & Action buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-400" title="User Permission Level">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="capitalize">{cmd.userLevel}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Cooldown Duration">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{cmd.cooldownSeconds}s</span>
                  </span>
                  {cmd.soundEffect && (
                    <span className="flex items-center gap-1 text-purple-300" title="Sound Effect Trigger">
                      <Volume2 className="w-3 h-3" />
                      <span className="capitalize">{cmd.soundEffect}</span>
                    </span>
                  )}
                  {cmd.pointsRewardOrCost ? (
                    <span
                      className={`flex items-center gap-1 font-bold ${
                        cmd.pointsRewardOrCost > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                      title={cmd.pointsRewardOrCost > 0 ? 'Points Reward' : 'Points Cost'}
                    >
                      <Coins className="w-3 h-3" />
                      <span>
                        {cmd.pointsRewardOrCost > 0 ? `+${cmd.pointsRewardOrCost}` : cmd.pointsRewardOrCost}
                      </span>
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (cmd.soundEffect) soundSynth.play(cmd.soundEffect as any);
                      onTestCommand(cmd);
                    }}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-purple-600/30 text-purple-300 hover:text-white transition-colors cursor-pointer"
                    title="Simulate Command in Chat"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => openEditModal(cmd)}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Command & Overlays"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCommand(cmd.id)}
                    className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Command"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingCommand ? 'Edit Custom Command' : 'Create Custom Command'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure trigger, response template, and on-screen overlays</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: General vs Overlay */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-white/10 rounded-2xl">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modalTab === 'general'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>1. Command & Response</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('overlay')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modalTab === 'overlay'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>2. On-Screen Overlay & Broadcast</span>
                {triggerOverlay && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* TAB 1: GENERAL */}
            {modalTab === 'general' && (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Command Trigger *</label>
                    <input
                      type="text"
                      value={cmdTrigger}
                      onChange={(e) => setCmdTrigger(e.target.value)}
                      placeholder="!hype or !discord"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Aliases (Comma separated)</label>
                    <input
                      type="text"
                      value={cmdAliases}
                      onChange={(e) => setCmdAliases(e.target.value)}
                      placeholder="!pog, !hypetrain"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Response Message Template *</label>
                  <textarea
                    value={cmdResponse}
                    onChange={(e) => setCmdResponse(e.target.value)}
                    placeholder="🔥 LET'S GOOO! HYPE IN CHAT! @{user} is turning up the energy!"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none leading-relaxed"
                  />

                  {/* Variable inserter chips */}
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Click to insert dynamic variable:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {availableVariables.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertVariable(v.tag, 'response')}
                          className="px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-mono transition-colors cursor-pointer"
                          title={v.desc}
                        >
                          {`{${v.tag}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">User Permission</label>
                    <select
                      value={cmdUserLevel}
                      onChange={(e) => setCmdUserLevel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="everyone">Everyone (All Chat)</option>
                      <option value="subscriber">Subscribers Only</option>
                      <option value="vip">VIPs & Mods</option>
                      <option value="moderator">Moderators Only</option>
                      <option value="owner">Streamer / Host Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Category</label>
                    <select
                      value={cmdCategory}
                      onChange={(e) => setCmdCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="socials">Socials</option>
                      <option value="stream">Stream Info</option>
                      <option value="fun">Fun & Memes</option>
                      <option value="info">Hardware / Specs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Cooldown (Seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={cmdCooldown}
                      onChange={(e) => setCmdCooldown(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Sound Synthesizer Cue</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={cmdSound}
                        onChange={(e) => setCmdSound(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="none">No Sound Effect</option>
                        <option value="coin">Coin Chime</option>
                        <option value="shoutout">Shoutout Chime</option>
                        <option value="airhorn">Stream Airhorn Hype</option>
                        <option value="victory">Victory Fanfare</option>
                        <option value="jackpot">Jackpot Trill</option>
                        <option value="alarm">Action Alarm</option>
                        <option value="level_up">Level Up Jingle</option>
                      </select>
                      {cmdSound !== 'none' && (
                        <button
                          type="button"
                          onClick={() => soundSynth.play(cmdSound as any)}
                          className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold transition-colors cursor-pointer"
                          title="Play Sound Preview"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Points Delta (+Reward / -Cost)</label>
                    <input
                      type="number"
                      value={cmdPointsDelta}
                      onChange={(e) => setCmdPointsDelta(Number(e.target.value))}
                      placeholder="0 (e.g. +50 or -20)"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Internal Note / Description</label>
                  <input
                    type="text"
                    value={cmdDesc}
                    onChange={(e) => setCmdDesc(e.target.value)}
                    placeholder="Optional brief note for streamers"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: OVERLAY & OBS BROADCAST */}
            {modalTab === 'overlay' && (
              <div className="space-y-4 text-xs">
                {/* Main Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/30">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Trigger On-Screen Overlay & Broadcast Actions</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Display celebrations, mass particle drops, trophy toasts, videos, or OBS scene switches when this command runs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTriggerOverlay(!triggerOverlay)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      triggerOverlay ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        triggerOverlay ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {triggerOverlay && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Overlay Type Selector */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">Overlay Effect Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'fireworks', label: 'Fireworks Blast', icon: '🎆' },
                          { id: 'confetti', label: 'Confetti Cannon', icon: '🎊' },
                          { id: 'sparkles', label: 'Golden Sparkles', icon: '✨' },
                          { id: 'mass_drop', label: 'Mass Drop Rain', icon: '🌧️' },
                          { id: 'banner', label: 'Trophy / Pop-up Banner', icon: '🏆' },
                          { id: 'shoutout', label: 'Creator Shoutout', icon: '🌟' },
                          { id: 'media_video', label: 'Video MP4 / WebM', icon: '🎬' },
                          { id: 'media_gif', label: 'Animated GIF Meme', icon: '🖼️' },
                          { id: 'obs_scene', label: 'OBS Scene Switch', icon: '📺' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setOverlayType(item.id as any)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              overlayType === item.id
                                ? 'bg-cyan-600/30 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/20'
                                : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mass Drop Configuration */}
                    {overlayType === 'mass_drop' && (
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span>Mass Drop Rain Settings</span>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Particle Drop Asset Preset</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'coins', label: 'Coins 🪙' },
                              { id: 'cookies', label: 'Cookies 🍪' },
                              { id: 'bills', label: 'Cash 💵' },
                              { id: 'gems', label: 'Gems 💎' },
                              { id: 'cats', label: 'Cats 🐱' },
                              { id: 'dogs', label: 'Dogs 🐶' },
                              { id: 'tacos', label: 'Tacos 🌮' },
                              { id: 'stars', label: 'Stardust ⭐' },
                              { id: 'gifts', label: 'Presents 🎁' },
                              { id: 'rockets', label: 'Rockets 🚀' },
                              { id: 'custom', label: 'Custom Upload 🖼️' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setOverlayDropPreset(preset.id as any)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs text-center transition-colors cursor-pointer ${
                                  overlayDropPreset === preset.id
                                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold'
                                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {overlayDropPreset === 'custom' && (
                          <div className="space-y-2">
                            <label className="block text-slate-300 font-bold">Custom Dropped Image (URL or Upload)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={customDropImageUrl}
                                onChange={(e) => setCustomDropImageUrl(e.target.value)}
                                placeholder="https://example.com/emote.png"
                                className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-slate-300 font-bold">Particle Density</label>
                            <span className="font-mono text-cyan-400 font-bold">{dropParticleCount} particles</span>
                          </div>
                          <input
                            type="range"
                            min={20}
                            max={150}
                            step={5}
                            value={dropParticleCount}
                            onChange={(e) => setDropParticleCount(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Banner / Pop-up Toast Configuration */}
                    {(overlayType === 'banner' || overlayType === 'shoutout' || overlayType === 'fireworks' || overlayType === 'confetti' || overlayType === 'sparkles') && (
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-purple-400" />
                          <span>Banner Titles & Styling</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Heading Template</label>
                            <input
                              type="text"
                              value={overlayTitle}
                              onChange={(e) => setOverlayTitle(e.target.value)}
                              placeholder="{user} ACTIVATED HYPE!"
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {['user', 'target', 'points'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => insertVariable(t, 'title')}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white"
                                >
                                  +{`{${t}}`}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Subtitle Template</label>
                            <input
                              type="text"
                              value={overlaySubtitle}
                              onChange={(e) => setOverlaySubtitle(e.target.value)}
                              placeholder="Broadcast alert transmitted to OBS"
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {['user', 'target', 'points'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => insertVariable(t, 'subtitle')}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 hover:text-white"
                                >
                                  +{`{${t}}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Banner Platform Preset</label>
                            <select
                              value={overlayBannerPreset}
                              onChange={(e) => setOverlayBannerPreset(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="xbox">Xbox 360 Pop</option>
                              <option value="playstation">PlayStation Trophy</option>
                              <option value="steam">Steam Notification</option>
                              <option value="generic">Cyber Toast</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Visual Theme</label>
                            <select
                              value={overlayTheme}
                              onChange={(e) => setOverlayTheme(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="neon-cyber">Neon Cyberpunk</option>
                              <option value="retro-synth">Retro Synthwave</option>
                              <option value="gold-royal">Gold Royal</option>
                              <option value="clean-dark">Clean Dark</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Icon / Emoji</label>
                            <div className="flex items-center gap-1.5">
                              {['🔥', '🚀', '👑', '💎', '⭐', '⚔️', '🎉', '☕'].map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => setOverlayIcon(ic)}
                                  className={`p-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                                    overlayIcon === ic ? 'bg-purple-600 border-purple-400' : 'bg-slate-950 border-white/10 hover:bg-slate-800'
                                  }`}
                                >
                                  {ic}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media Video / GIF Configuration */}
                    {(overlayType === 'media_video' || overlayType === 'media_gif') && (
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-cyan-400" />
                          <span>Video & GIF Media Overlay Controls</span>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Media Source URL or Upload</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={mediaUrl}
                              onChange={(e) => setMediaUrl(e.target.value)}
                              placeholder={overlayType === 'media_video' ? 'https://.../video.mp4' : 'https://.../meme.gif'}
                              className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Presets Picker */}
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1">Or choose a built-in media preset:</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {DEFAULT_MEDIA_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setMediaUrl(preset.url);
                                  setMediaType(preset.mediaType);
                                  if (preset.chromaKey) setChromaKey(preset.chromaKey as any);
                                  if (preset.defaultDuration) setOverlayDuration(preset.defaultDuration);
                                }}
                                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 truncate text-left transition-colors cursor-pointer"
                              >
                                <span>{preset.icon}</span>
                                <span className="truncate">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Screen Position</label>
                            <select
                              value={mediaPosition}
                              onChange={(e) => setMediaPosition(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="center">Center Screen</option>
                              <option value="fullscreen">Full Screen Cover</option>
                              <option value="top-left">Top Left</option>
                              <option value="top-right">Top Right</option>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="bottom-right">Bottom Right</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Chroma Key Filter</label>
                            <select
                              value={chromaKey}
                              onChange={(e) => setChromaKey(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="none">None (Standard)</option>
                              <option value="green">Green Screen Removal</option>
                              <option value="blue">Blue Screen Removal</option>
                              <option value="black">Black Background Removal</option>
                              <option value="magenta">Magenta Removal</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-slate-300 font-bold">Volume</label>
                              <span className="font-mono text-cyan-400">{Math.round(mediaVolume * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={mediaVolume}
                              onChange={(e) => setMediaVolume(Number(e.target.value))}
                              className="w-full accent-cyan-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OBS Scene Switcher */}
                    {overlayType === 'obs_scene' && (
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Tv className="w-4 h-4 text-indigo-400" />
                          <span>OBS Studio Scene Switcher</span>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Target OBS Scene to Activate</label>
                          {obsConfig?.scenes && obsConfig.scenes.length > 0 ? (
                            <select
                              value={obsSceneToSwitch}
                              onChange={(e) => setObsSceneToSwitch(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none font-mono"
                            >
                              {obsConfig.scenes.map((scene) => (
                                <option key={scene} value={scene}>
                                  {scene}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={obsSceneToSwitch}
                              onChange={(e) => setObsSceneToSwitch(e.target.value)}
                              placeholder="e.g. Gaming & Webcam or BRB"
                              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                            />
                          )}
                          <p className="text-[10px] text-slate-500 mt-1">
                            When chat triggers this command, DroidOS sends an OBS WebSocket signal to switch the live scene.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Duration Slider & Live Test */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-slate-300 font-bold">On-Screen Overlay Duration</label>
                          <span className="font-mono text-cyan-400 font-bold">{overlayDuration} Seconds</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={30}
                          value={overlayDuration}
                          onChange={(e) => setOverlayDuration(Number(e.target.value))}
                          className="w-full accent-cyan-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleTestCurrentOverlay}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>⚡ Test Overlay Live</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/mp4,video/webm"
              className="hidden"
            />

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {triggerOverlay && (
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Overlay Armed</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!cmdTrigger.trim() || !cmdResponse.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {editingCommand ? 'Save Changes' : 'Create Command'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
