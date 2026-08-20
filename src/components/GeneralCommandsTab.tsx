import React, { useState } from 'react';
import { MessageSquareCode, Plus, Trash2, Check, Sparkles, Sliders } from 'lucide-react';
import { KeywordTrigger } from '../types';

interface GeneralCommandsTabProps {
  triggers: KeywordTrigger[];
  setTriggers: React.Dispatch<React.SetStateAction<KeywordTrigger[]>>;
  onSaveNotice: () => void;
}

export const GeneralCommandsTab: React.FC<GeneralCommandsTabProps> = ({
  triggers,
  setTriggers,
  onSaveNotice
}) => {
  const generalTriggers = triggers.filter((t) => t.category === 'general');

  // Add general command
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newCooldown, setNewCooldown] = useState(3);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newResponse.trim()) return;

    const item: KeywordTrigger = {
      id: `gen-${Date.now()}`,
      trigger: newTrigger.trim().startsWith('!') ? newTrigger.trim() : `!${newTrigger.trim()}`,
      matchType: 'exact',
      response: newResponse.trim(),
      cooldownSeconds: Number(newCooldown) || 3,
      enabled: true,
      usageCount: 0,
      category: 'general'
    };

    setTriggers((prev) => [...prev, item]);
    setNewTrigger('');
    setNewResponse('');
    onSaveNotice();
  };

  const handleDelete = (id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
    onSaveNotice();
  };

  const handleToggle = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">General Conversational Commands</h2>
            <p className="text-xs text-slate-400">
              Built-in conversational keywords (!hi, !howareyou, !mood, !points, !redeem, !achievements)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: General Commands List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {generalTriggers.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition-all ${
                t.enabled
                  ? 'bg-slate-900/90 border-slate-800 shadow-md'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-950/80 border border-blue-800/40 text-blue-300 font-mono font-bold text-xs">
                      {t.trigger}
                    </span>
                    <span className="text-[10px] text-slate-400">Cooldown: {t.cooldownSeconds}s</span>
                    <span className="text-[10px] text-slate-500">• Used: {t.usageCount} times</span>
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono leading-relaxed">
                    {t.response}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(t.id)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      t.enabled ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {t.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Add General Command (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add General Trigger</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Trigger Command</label>
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="!joke"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bot Response Template</label>
              <textarea
                rows={3}
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                placeholder="🤖 @{username}, why do programmers prefer dark mode? Because light attracts bugs!"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Tokens: &#123;username&#125;, &#123;streamer_name&#125;, &#123;user_points&#125;</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cooldown (Seconds)</label>
              <input
                type="number"
                value={newCooldown}
                onChange={(e) => setNewCooldown(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Command</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
