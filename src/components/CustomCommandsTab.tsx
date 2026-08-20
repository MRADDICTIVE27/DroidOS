import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Check, Sparkles, Filter, Code } from 'lucide-react';
import { KeywordTrigger, CustomRole } from '../types';

interface CustomCommandsTabProps {
  triggers: KeywordTrigger[];
  setTriggers: React.Dispatch<React.SetStateAction<KeywordTrigger[]>>;
  roles: CustomRole[];
  onSaveNotice: () => void;
}

export const CustomCommandsTab: React.FC<CustomCommandsTabProps> = ({
  triggers,
  setTriggers,
  roles,
  onSaveNotice
}) => {
  const customTriggers = triggers.filter((t) => t.category !== 'general');

  // Add custom command
  const [newTrigger, setNewTrigger] = useState('');
  const [newMatch, setNewMatch] = useState<KeywordTrigger['matchType']>('starts_with');
  const [newResponse, setNewResponse] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCooldown, setNewCooldown] = useState(5);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newResponse.trim()) return;

    const item: KeywordTrigger = {
      id: `cust-${Date.now()}`,
      trigger: newTrigger.trim().startsWith('!') ? newTrigger.trim() : `!${newTrigger.trim()}`,
      matchType: newMatch,
      response: newResponse.trim(),
      roleRestriction: newRole || undefined,
      cooldownSeconds: Number(newCooldown) || 5,
      enabled: true,
      usageCount: 0,
      category: 'custom'
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
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Custom Stream Commands & Actions</h2>
            <p className="text-xs text-slate-400">
              Create broadcaster links, social media tags, specs, hardware, and role-locked commands
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Custom Commands List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {customTriggers.map((t) => (
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 font-mono font-bold text-xs">
                      {t.trigger}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Match: {t.matchType}
                    </span>
                    {t.roleRestriction && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                        🔒 Only {t.roleRestriction}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Cooldown: {t.cooldownSeconds}s</span>
                    <span className="text-[10px] text-slate-500">• {t.usageCount} executions</span>
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

        {/* Right: Add Custom Command (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Create Custom Command</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Command Trigger</label>
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="!merch"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Match Type</label>
                <select
                  value={newMatch}
                  onChange={(e: any) => setNewMatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="starts_with">Starts With</option>
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains Word</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Lock</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Everyone (Public)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} Tier & Higher
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Response Template</label>
              <textarea
                rows={3}
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                placeholder="🛍️ Official Streamer Merch: store.streamer.tv - Use code STREAM10 for 10% off!"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cooldown (Seconds)</label>
              <input
                type="number"
                value={newCooldown}
                onChange={(e) => setNewCooldown(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Command</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
