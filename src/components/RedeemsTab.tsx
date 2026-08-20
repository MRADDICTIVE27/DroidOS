import React, { useState } from 'react';
import { Gift, Plus, Trash2, Check, Sparkles, ShoppingBag, Clock, ShieldCheck, Upload, Music, Image as ImageIcon } from 'lucide-react';
import { AudioQueueItem, RedeemItem, SoundEffectItem, ViewerProfile, PointsConfig } from '../types';
import { playSynthesizedSound } from '../services/soundService';
import { QueueManager } from './QueueManager';

interface RedeemsTabProps {
  redeems: RedeemItem[];
  setRedeems: React.Dispatch<React.SetStateAction<RedeemItem[]>>;
  soundEffects: SoundEffectItem[];
  pointsConfig: PointsConfig;
  profiles: ViewerProfile[];
  audioQueue: AudioQueueItem[];
  isProcessingQueue: boolean;
  onClearQueue: () => void;
  onRemoveQueueItem: (id: string) => void;
  onSaveNotice: () => void;
  onSimulateRedeem: (redeem: RedeemItem, username: string) => void;
}

export const RedeemsTab: React.FC<RedeemsTabProps> = ({
  redeems,
  setRedeems,
  soundEffects,
  pointsConfig,
  profiles,
  audioQueue,
  isProcessingQueue,
  onClearQueue,
  onRemoveQueueItem,
  onSaveNotice,
  onSimulateRedeem
}) => {
  // New Redeem Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(250);
  const [newType, setNewType] = useState<RedeemItem['type']>('sound');
  const [newSoundId, setNewSoundId] = useState(soundEffects[0]?.id || '');
  const [newGifUrl, setNewGifUrl] = useState('');
  const [newCooldown, setNewCooldown] = useState(30);
  const [selectedSimUser, setSelectedSimUser] = useState(profiles[0]?.username || 'SampleViewer');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'sound' | 'gif') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'sound') {
        // Create a temporary sound effect entry if needed, or just use URL directly
        setNewGifUrl(dataUrl); // Reusing state for custom file URL
      } else {
        setNewGifUrl(dataUrl);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: RedeemItem = {
      id: `rdm-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom stream reward',
      cost: Number(newCost) || 100,
      type: newType,
      linkedSoundId: newType === 'sound' ? (newSoundId || undefined) : undefined,
      gifUrl: (newType === 'gif' || (newType === 'sound' && !newSoundId)) ? newGifUrl.trim() : undefined,
      cooldownSeconds: Number(newCooldown) || 15,
      requireApproval: newType === 'custom',
      enabled: true,
      timesRedeemed: 0
    };

    setRedeems((prev) => [...prev, item]);
    setNewTitle('');
    setNewDesc('');
    setNewGifUrl('');
    onSaveNotice();
  };

  const handleDeleteRedeem = (id: string) => {
    setRedeems((prev) => prev.filter((r) => r.id !== id));
    onSaveNotice();
  };

  const handleToggle = (id: string) => {
    setRedeems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Stream Rewards & Channel Points Store</h2>
            <p className="text-xs text-slate-400">
              Viewers spend {pointsConfig.currencyName} to trigger OBS sounds, GIF overlays, chat perks, and shoutouts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Rewards Store (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {redeems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.enabled
                    ? 'bg-slate-900/90 border-slate-800 shadow-md'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-xs">{item.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-950/80 text-pink-300 border border-pink-800/40 font-mono">
                        {item.cost} {pointsConfig.currencySymbol}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-950 font-mono">
                        Type: {item.type}
                      </span>
                      <span>Cooldown: {item.cooldownSeconds}s</span>
                      <span>Redeemed: {item.timesRedeemed}x</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSimulateRedeem(item, selectedSimUser)}
                      className="px-2 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold cursor-pointer"
                      title="Test Redeem"
                    >
                      Redeem
                    </button>
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        item.enabled ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => handleDeleteRedeem(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Create Custom Redeem Item (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-pink-400" />
            <span>Create New Reward</span>
          </h3>

          <form onSubmit={handleAddRedeem} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reward Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                placeholder="e.g. Laser SFX Blast"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                placeholder="Plays an on-stream SFX when redeemed."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reward Type</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="sound">🔊 Sound Effect</option>
                  <option value="gif">🖼️ GIF Overlay</option>
                  <option value="highlight">⭐ Highlight Chat</option>
                  <option value="custom">💬 Custom Request</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cost ({pointsConfig.currencyName})</label>
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
            </div>

            {newType === 'sound' && (
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold mb-1">Sound Selection</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={newSoundId}
                    onChange={(e) => setNewSoundId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    <option value="">-- Use Uploaded File --</option>
                    {soundEffects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.type === 'synth' ? s.synthPreset : 'Custom'})
                      </option>
                    ))}
                  </select>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, 'sound')}
                      className="hidden"
                      id="redeem-sound-upload"
                    />
                    <label
                      htmlFor="redeem-sound-upload"
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] text-slate-200 cursor-pointer transition-all"
                    >
                      <Music className="w-3.5 h-3.5" />
                      {isUploading ? 'Uploading...' : 'Upload Custom Sound'}
                    </label>
                  </div>
                  {newSoundId === '' && newGifUrl && (
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 truncate">
                      File Ready: {newGifUrl.substring(0, 30)}...
                    </div>
                  )}
                </div>
              </div>
            )}

            {newType === 'gif' && (
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold mb-1">GIF / Image Selection</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={newGifUrl}
                    onChange={(e) => setNewGifUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    placeholder="https://media.giphy.com/media/.../giphy.gif"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'gif')}
                      className="hidden"
                      id="redeem-gif-upload"
                    />
                    <label
                      htmlFor="redeem-gif-upload"
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] text-slate-200 cursor-pointer transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {isUploading ? 'Uploading...' : 'Upload Local Image/GIF'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cooldown (Seconds)</label>
              <input
                type="number"
                value={newCooldown}
                onChange={(e) => setNewCooldown(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Store Reward</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800">
            <QueueManager 
              queue={audioQueue}
              isProcessing={isProcessingQueue}
              onClearQueue={onClearQueue}
              onRemoveItem={onRemoveQueueItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
