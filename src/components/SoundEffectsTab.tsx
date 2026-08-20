import React, { useState } from 'react';
import { Volume2, Play, Plus, Trash2, Sparkles, Check, Music } from 'lucide-react';
import { SoundEffectItem } from '../types';
import { playSynthesizedSound, playCustomAudioUrl } from '../services/soundService';

interface SoundEffectsTabProps {
  soundEffects: SoundEffectItem[];
  setSoundEffects: React.Dispatch<React.SetStateAction<SoundEffectItem[]>>;
  onSaveNotice: () => void;
}

export const SoundEffectsTab: React.FC<SoundEffectsTabProps> = ({
  soundEffects,
  setSoundEffects,
  onSaveNotice
}) => {
  const [masterVolume, setMasterVolume] = useState<number>(0.7);

  // New Sound Form
  const [newName, setNewName] = useState('');
  const [newCommand, setNewCommand] = useState('!sfx custom');
  const [newType, setNewType] = useState<'synth' | 'custom_url'>('synth');
  const [newPreset, setNewPreset] = useState<SoundEffectItem['synthPreset']>('fanfare');
  const [newUrl, setNewUrl] = useState('');
  const [newCost, setNewCost] = useState(100);

  const handleTestSound = (item: SoundEffectItem) => {
    const vol = (item.volume || 0.7) * masterVolume;
    if (item.type === 'synth') {
      playSynthesizedSound(item.synthPreset, vol);
    } else if (item.customAudioUrl) {
      playCustomAudioUrl(item.customAudioUrl, vol);
    }
  };

  const handleAddSound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSound: SoundEffectItem = {
      id: `sfx-${Date.now()}`,
      name: newName.trim(),
      triggerCommand: newCommand.trim(),
      type: newType,
      synthPreset: newPreset,
      customAudioUrl: newUrl.trim() || undefined,
      volume: 0.7,
      costPoints: newCost,
      enabled: true
    };

    setSoundEffects((prev) => [...prev, newSound]);
    setNewName('');
    setNewUrl('');
    onSaveNotice();
  };

  const handleDeleteSound = (id: string) => {
    setSoundEffects((prev) => prev.filter((s) => s.id !== id));
    onSaveNotice();
  };

  const handleToggleSound = (id: string) => {
    setSoundEffects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Stream Sound Effects & Soundboard</h2>
            <p className="text-xs text-slate-400">
              Low-latency synthesized audio, custom audio links, and chat command SFX triggers
            </p>
          </div>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-semibold">Master Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
          <span className="text-slate-400 font-mono w-8 text-right">{Math.round(masterVolume * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Soundboard (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {soundEffects.map((item) => (
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
                      <h3 className="font-bold text-white text-xs">{item.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 font-mono">
                        {item.type === 'synth' ? `Preset: ${item.synthPreset}` : 'Custom Audio'}
                      </span>
                    </div>
                    {item.triggerCommand && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        Command: <span className="text-cyan-300">{item.triggerCommand}</span>
                      </p>
                    )}
                    {item.costPoints !== undefined && (
                      <p className="text-[11px] text-amber-400 font-mono">
                        Cost: {item.costPoints} points
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestSound(item)}
                      className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md shadow-cyan-600/20"
                      title="Test Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleToggleSound(item.id)}
                      className={`p-2 rounded-xl text-xs font-bold cursor-pointer ${
                        item.enabled
                          ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                      title="Toggle Active"
                    >
                      {item.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => handleDeleteSound(item.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Add New Sound Effect (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Custom Sound</span>
          </h3>

          <form onSubmit={handleAddSound} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sound Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Laser Beam"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Chat Trigger Command</label>
              <input
                type="text"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="!sfx laser"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sound Source</label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="synth">Web Audio Synthesizer (Built-in)</option>
                <option value="custom_url">External Audio URL (MP3/WAV)</option>
              </select>
            </div>

            {newType === 'synth' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Synth Preset</label>
                <select
                  value={newPreset}
                  onChange={(e: any) => setNewPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="fanfare">🎺 Victory Fanfare</option>
                  <option value="airhorn">📢 Hype Airhorn</option>
                  <option value="level_up">⭐ Level Up Chords</option>
                  <option value="coin">🪙 Coin Reward Ping</option>
                  <option value="zap">⚡ Sci-Fi Laser Zap</option>
                  <option value="bell">🔔 Crystal Bell Ring</option>
                  <option value="applause">👏 Crowd Applause</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audio File URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://mysite.com/audio.mp3"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Redeem Cost (Points)</label>
              <input
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sound Effect</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
