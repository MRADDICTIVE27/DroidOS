import React, { useState, useRef } from 'react';
import {
  Gift,
  Volume2,
  Sparkles,
  Plus,
  Trash2,
  Play,
  Layers,
  Coins,
  Check,
  Flame,
  Radio,
  Video,
  Image as ImageIcon,
  Upload,
  Link,
  Film,
  Sliders,
  X,
  Edit2,
  Maximize2,
  Tv,
  HelpCircle,
  Clock
} from 'lucide-react';
import { RedeemItem, OBSConfig, EconomySettings } from '../types';
import { soundSynth } from '../services/soundSynthesizer';
import { DEFAULT_MEDIA_PRESETS, MediaPresetItem } from '../data/defaultData';

interface RedeemsSoundboardTabProps {
  redeems: RedeemItem[];
  onAddRedeem: (item: RedeemItem) => void;
  onUpdateRedeem?: (item: RedeemItem) => void;
  onDeleteRedeem: (id: string) => void;
  onToggleRedeem: (id: string) => void;
  onTriggerRedeemTest: (item: RedeemItem) => void;
  obsConfig: OBSConfig;
  economy: EconomySettings;
  redeemQueue: Array<{ id: string; name: string; cost: number; username: string; timestamp: number }>;
  onClearQueue: () => void;
}

export const RedeemsSoundboardTab: React.FC<RedeemsSoundboardTabProps> = ({
  redeems,
  onAddRedeem,
  onUpdateRedeem,
  onDeleteRedeem,
  onToggleRedeem,
  onTriggerRedeemTest,
  obsConfig,
  economy,
  redeemQueue,
  onClearQueue
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RedeemItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('350');
  const [type, setType] = useState<RedeemItem['type']>('media_gif');
  const [icon, setIcon] = useState('🦆');
  const [description, setDescription] = useState('');
  const [soundPreset, setSoundPreset] = useState('jackpot');
  const [obsScene, setObsScene] = useState('Just Chatting & Full Cam');

  // Media Config State
  const [mediaSourceType, setMediaSourceType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'gif' | 'image'>('gif');
  const [mediaPosition, setMediaPosition] = useState<RedeemItem['mediaPosition']>('center');
  const [mediaFit, setMediaFit] = useState<RedeemItem['mediaFit']>('contain');
  const [mediaVolume, setMediaVolume] = useState<number>(0.85);
  const [chromaKey, setChromaKey] = useState<RedeemItem['chromaKey']>('none');
  const [overlayDuration, setOverlayDuration] = useState<number>(7);
  const [caption, setCaption] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-duck-rave');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const soundMatrix = [
    { label: 'Airhorn Blast', preset: 'airhorn', icon: '📢', desc: 'Classic DJ triple horn' },
    { label: 'Level Up', preset: 'level_up', icon: '⭐', desc: '8-bit retro fanfare' },
    { label: 'Jackpot Chime', preset: 'jackpot', icon: '💎', desc: 'Fast arcade arpeggio' },
    { label: 'Victory March', preset: 'victory', icon: '🏆', desc: 'Grand victory melody' },
    { label: 'Laser Cannon', preset: 'laser', icon: '⚡', desc: 'Retro sci-fi shot' },
    { label: 'Vault Alarm', preset: 'alarm', icon: '🚨', desc: 'Heist alert sirens' },
    { label: 'Coin Clink', preset: 'coin', icon: '🪙', desc: 'Crisp pickup ping' },
    { label: 'Shoutout Chime', preset: 'shoutout', icon: '✨', desc: 'Warm chord sparkle' }
  ];

  // Open modal for new creation
  const handleOpenNewModal = (initialType?: RedeemItem['type']) => {
    setEditingItem(null);
    setName('');
    setCost('350');
    setType(initialType || 'media_gif');
    setIcon(initialType === 'media_video' ? '💥' : initialType === 'sound' ? '📢' : '🦆');
    setDescription('');
    setSoundPreset('jackpot');
    setObsScene(obsConfig.currentScene || 'Just Chatting & Full Cam');
    setMediaSourceType('preset');
    setSelectedPresetId('preset-duck-rave');
    const defaultPreset = DEFAULT_MEDIA_PRESETS[0];
    setMediaUrl(defaultPreset.url);
    setMediaType(defaultPreset.mediaType);
    setMediaPosition('center');
    setMediaFit('contain');
    setMediaVolume(0.85);
    setChromaKey('none');
    setOverlayDuration(7);
    setCaption('🦆 RAVE TIME! Chat party triggered!');
    setUploadedFileName('');
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: RedeemItem) => {
    setEditingItem(item);
    setName(item.name);
    setCost(item.cost.toString());
    setType(item.type);
    setIcon(item.icon);
    setDescription(item.description);
    setSoundPreset(item.soundPreset || 'airhorn');
    setObsScene(item.obsScene || 'Just Chatting & Full Cam');
    setMediaUrl(item.mediaUrl || '');
    setMediaType(item.mediaType || (item.type === 'media_video' ? 'video' : 'gif'));
    setMediaSourceType(item.mediaSourceType || (item.mediaUrl ? 'url' : 'preset'));
    setMediaPosition(item.mediaPosition || 'center');
    setMediaFit(item.mediaFit || 'contain');
    setMediaVolume(item.mediaVolume ?? 0.85);
    setChromaKey(item.chromaKey || 'none');
    setOverlayDuration(item.overlayDuration || 6);
    setCaption(item.caption || '');
    setUploadedFileName('');
    setShowModal(true);
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: MediaPresetItem) => {
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setCost(preset.suggestedCost.toString());
    setMediaType(preset.mediaType);
    setType(preset.mediaType === 'video' ? 'media_video' : 'media_gif');
    setMediaUrl(preset.url);
    setIcon(preset.icon);
    setDescription(preset.description);
    setOverlayDuration(preset.defaultDuration);
    setChromaKey(preset.chromaKey || 'none');
    if (preset.soundPreset) setSoundPreset(preset.soundPreset);
    setCaption(preset.mediaType === 'video' ? '💥 BOOM! Total stream destruction!' : '🦆 RAVE TIME! Chat party triggered!');
  };

  // Handle File Upload (MP4, WebM, GIF, WebP)
  const handleFileUpload = (file: File) => {
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
    const isGifOrImg = file.type.startsWith('image/') || file.name.endsWith('.gif') || file.name.endsWith('.webp');

    setUploadedFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setMediaUrl(dataUrl);
      if (isVideo) {
        setMediaType('video');
        setType('media_video');
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        setMediaType('gif');
        setType('media_gif');
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isVideo = type === 'media_video' || mediaType === 'video';
    const isGif = type === 'media_gif' || mediaType === 'gif';

    const itemData: RedeemItem = {
      id: editingItem ? editingItem.id : `rdm-${Date.now()}`,
      name: name.trim(),
      cost: parseInt(cost, 10) || 300,
      type,
      description: description.trim() || `${name} reward for stream viewers`,
      icon: icon.trim() || (isVideo ? '🎬' : isGif ? '🖼️' : '🎁'),
      soundPreset: soundPreset || undefined,
      obsScene: type === 'obs_scene' ? obsScene : undefined,
      overlayDuration: isVideo || isGif || type === 'overlay' ? overlayDuration : undefined,
      enabled: editingItem ? editingItem.enabled : true,
      mediaType: isVideo ? 'video' : isGif ? 'gif' : undefined,
      mediaUrl: isVideo || isGif ? mediaUrl.trim() : undefined,
      mediaSourceType,
      mediaFit,
      mediaPosition,
      mediaVolume: isVideo ? mediaVolume : undefined,
      chromaKey: isVideo || isGif ? chromaKey : undefined,
      caption: caption.trim() || undefined
    };

    if (editingItem && onUpdateRedeem) {
      onUpdateRedeem(itemData);
    } else {
      onAddRedeem(itemData);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-900/60 to-purple-950/40 border border-pink-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/20">
            🎁
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Stream Rewards & Channel Points Store</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Custom MP4 video animations, animated GIFs, audio sound cues, and OBS overlays triggered via <code className="text-pink-300">!redeem [name]</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenNewModal('media_video')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600/80 hover:bg-red-500 shadow-md shadow-red-600/20 border border-red-400/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Video className="w-3.5 h-3.5" />
            <span>+ Add MP4 Video</span>
          </button>
          <button
            onClick={() => handleOpenNewModal('media_gif')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-pink-600/80 hover:bg-pink-500 shadow-md shadow-pink-600/20 border border-pink-400/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>+ Add GIF Meme</span>
          </button>
          <button
            onClick={() => handleOpenNewModal('sound')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600/80 hover:bg-purple-500 shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Custom Sound</span>
          </button>
        </div>
      </div>

      {/* Live Redeem Queue Section */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-pink-400" />
            <h2 className="text-sm font-extrabold text-white">Live Redeems & Alert Queue</h2>
          </div>
          {redeemQueue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-[10px] font-black transition-all cursor-pointer"
            >
              Clear Queue
            </button>
          )}
        </div>

        {redeemQueue.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-xs">
            No pending redeems. When viewers type <code className="text-pink-300">!redeem</code> in chat, they will show up here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
            {redeemQueue.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-extrabold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Redeemed by <span className="text-pink-300 font-bold">@{item.username}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString()} • {item.cost} pts
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Meme Quick Add Shelf */}
      <div className="p-5 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.2)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Instant Streamer Meme & Video Presets Gallery
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Click to preview or customize instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {DEFAULT_MEDIA_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                handleSelectPreset(preset);
                setShowModal(true);
              }}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/50 flex flex-col items-center text-center space-y-2 transition-all cursor-pointer group hover:scale-[1.03]"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                <img
                  src={preset.previewUrl}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-black/70 text-white">
                  {preset.mediaType === 'video' ? 'MP4' : 'GIF'}
                </span>
              </div>
              <div className="min-w-0 w-full">
                <div className="text-[11px] font-bold text-white truncate">{preset.name}</div>
                <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
                  {preset.suggestedCost} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Soundboard Matrix */}
      <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white">Instant Soundboard Synthesizer</h2>
          </div>
          <span className="text-[11px] text-slate-400">Click to preview live Web Audio on stream</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {soundMatrix.map((snd) => (
            <button
              key={snd.preset}
              onClick={() => soundSynth.play(snd.preset)}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/40 flex items-center gap-3 transition-all active:scale-95 text-left group cursor-pointer backdrop-blur-md"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{snd.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{snd.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{snd.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Store Grid */}
      <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-extrabold text-white">Configured Channel Rewards ({redeems.length})</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Currency: {economy.currencyName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {redeems.map((item) => {
            const isVideo = item.type === 'media_video' || item.mediaType === 'video';
            const isGif = item.type === 'media_gif' || item.mediaType === 'gif';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all backdrop-blur-md ${
                  item.enabled
                    ? 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    : 'bg-white/[0.01] border-white/5 opacity-50'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold text-amber-300 font-mono">
                            {item.cost.toLocaleString()} {economy.currencySymbol}
                          </span>
                          {item.overlayDuration && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ⏱️ {item.overlayDuration}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${
                        isVideo
                          ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : isGif
                          ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                          : item.type === 'sound'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : item.type === 'obs_scene'
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-white/[0.05] border-white/10 text-slate-300'
                      }`}
                    >
                      {isVideo ? '🎬 MP4 Video' : isGif ? '🖼️ GIF Meme' : item.type}
                    </span>
                  </div>

                  {/* Media Thumbnail Preview if Video or GIF */}
                  {(isVideo || isGif) && item.mediaUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 h-28 flex items-center justify-center group/media">
                      {isVideo ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Specs Overlay Badges */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] font-bold text-white/90 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md">
                        <span className="truncate">Pos: {item.mediaPosition || 'Center'}</span>
                        {item.chromaKey && item.chromaKey !== 'none' && (
                          <span className="text-emerald-400 uppercase">Chroma: {item.chromaKey}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTriggerRedeemTest(item)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Fire instant overlay test"
                    >
                      <Play className="w-3 h-3" /> Test
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Edit reward properties"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => onToggleRedeem(item.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        item.enabled
                          ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                          : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                      }`}
                    >
                      {item.enabled ? 'Off' : 'On'}
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteRedeem(item.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                    title="Delete reward"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Custom Redeem Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900/95 border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-extrabold text-white">
                  {editingItem ? 'Edit Channel Reward' : 'Create New Stream Reward'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Action Type Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Reward Action Type:</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('media_video');
                      setMediaType('video');
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      type === 'media_video' || (mediaType === 'video' && type !== 'sound')
                        ? 'bg-red-500/20 border-red-400 text-red-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-[10px] font-bold">MP4 Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('media_gif');
                      setMediaType('gif');
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      type === 'media_gif' || (mediaType === 'gif' && type !== 'sound')
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold">GIF Meme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('sound')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      type === 'sound'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Sound Cue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('overlay')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      type === 'overlay'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Confetti FX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('obs_scene')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      type === 'obs_scene'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span className="text-[10px] font-bold">OBS Scene</span>
                  </button>
                </div>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Reward Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Michael Bay Explosion"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost ({economy.currencySymbol}):</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-400"
                    required
                  />
                </div>
              </div>

              {/* Rich Media Picker Section (if Video or GIF) */}
              {(type === 'media_video' || type === 'media_gif' || mediaType === 'video' || mediaType === 'gif') && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-pink-400" />
                      Media Asset Source
                    </span>

                    {/* Source Tab Toggle */}
                    <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setMediaSourceType('preset')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          mediaSourceType === 'preset' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaSourceType('upload')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          mediaSourceType === 'upload' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload Local File
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaSourceType('url')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          mediaSourceType === 'url' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Direct URL
                      </button>
                    </div>
                  </div>

                  {/* Preset Selector */}
                  {mediaSourceType === 'preset' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                        {DEFAULT_MEDIA_PRESETS.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPreset(p)}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              selectedPresetId === p.id || mediaUrl === p.url
                                ? 'bg-pink-500/20 border-pink-400 text-white'
                                : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                            }`}
                          >
                            <img src={p.previewUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold truncate">{p.name}</div>
                              <div className="text-[9px] text-slate-400 uppercase">{p.mediaType}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local File Upload Selector */}
                  {mediaSourceType === 'upload' && (
                    <div className="space-y-2">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                        }}
                        className="border-2 border-dashed border-pink-500/40 hover:border-pink-400 rounded-xl p-4 text-center bg-pink-500/[0.03] hover:bg-pink-500/[0.08] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5"
                      >
                        <Upload className="w-5 h-5 text-pink-400" />
                        <span className="font-bold text-white text-xs">
                          {uploadedFileName || 'Click to Browse or Drag & Drop .MP4, .WebM, or .GIF'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Supports local offline playback directly saved in browser storage
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,image/gif,image/webp,image/png,image/jpeg"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Direct Web URL Selector */}
                  {mediaSourceType === 'url' && (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        placeholder="https://media.giphy.com/.../giphy.gif or https://.../video.mp4"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-pink-400"
                      />
                      <p className="text-[10px] text-slate-400">
                        Paste direct links to Tenor, Giphy, Imgur, Streamable, or any public MP4/GIF file.
                      </p>
                    </div>
                  )}

                  {/* Live Modal Player Preview */}
                  {mediaUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 max-h-40 flex items-center justify-center p-2">
                      {mediaType === 'video' ? (
                        <video
                          src={mediaUrl}
                          autoPlay
                          playsInline
                          muted
                          loop
                          className="max-h-36 max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="max-h-36 max-w-full rounded-lg object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Placement & Chroma Key Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-semibold mb-1">Screen Position:</label>
                      <select
                        value={mediaPosition}
                        onChange={(e) => setMediaPosition(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                      >
                        <option value="center">Center of Screen</option>
                        <option value="fullscreen">Fullscreen Takeover</option>
                        <option value="top-left">Top Left Corner</option>
                        <option value="top-right">Top Right Corner</option>
                        <option value="bottom-left">Bottom Left Corner</option>
                        <option value="bottom-right">Bottom Right Corner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-semibold mb-1">Chroma Key Filter:</label>
                      <select
                        value={chromaKey}
                        onChange={(e) => setChromaKey(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                      >
                        <option value="none">None (Standard)</option>
                        <option value="green">Green Screen (#00FF00)</option>
                        <option value="black">Black Screen (Screen Blend)</option>
                        <option value="blue">Blue Screen (#0000FF)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                        Duration ({overlayDuration}s):
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="20"
                        value={overlayDuration}
                        onChange={(e) => setOverlayDuration(parseInt(e.target.value, 10))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Caption Banner */}
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">
                      On-Screen Caption Banner (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 💥 BOOM! Total stream destruction!"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              )}

              {/* Accompanying Sound Preset */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Accompanying Sound Synth:</label>
                  <select
                    value={soundPreset}
                    onChange={(e) => setSoundPreset(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-400/50"
                  >
                    <option value="jackpot">💎 Jackpot Chime</option>
                    <option value="alarm">🚨 Vault Alarm</option>
                    <option value="victory">🏆 Victory March</option>
                    <option value="airhorn">📢 Stadium Airhorn</option>
                    <option value="level_up">⭐ Level Up</option>
                    <option value="laser">⚡ Laser Cannon</option>
                    <option value="coin">🪙 Coin Clink</option>
                    <option value="shoutout">✨ Chime Sparkle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emoji / Icon:</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-400/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chat Description:</label>
                <input
                  type="text"
                  placeholder="What happens on stream when chat redeems this..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-400/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-bold text-xs cursor-pointer border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-pink-600/20 transition-transform active:scale-95"
                >
                  {editingItem ? 'Update Reward' : 'Save & Publish Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
