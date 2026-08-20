import React, { useState } from 'react';
import { Clock, Plus, Trash2, Check, Sparkles, Send, Play } from 'lucide-react';
import { TimedAutomation } from '../types';

interface AutomationsTabProps {
  automations: TimedAutomation[];
  setAutomations: React.Dispatch<React.SetStateAction<TimedAutomation[]>>;
  onSaveNotice: () => void;
  onBroadcastNow: (msg: string) => void;
}

export const AutomationsTab: React.FC<AutomationsTabProps> = ({
  automations,
  setAutomations,
  onSaveNotice,
  onBroadcastNow
}) => {
  const [newName, setNewName] = useState('');
  const [newInterval, setNewInterval] = useState(20);
  const [newMessage, setNewMessage] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMessage.trim()) return;

    const item: TimedAutomation = {
      id: `auto-${Date.now()}`,
      name: newName.trim(),
      intervalMinutes: Number(newInterval) || 15,
      messageTemplate: newMessage.trim(),
      enabled: true
    };

    setAutomations((prev) => [...prev, item]);
    setNewName('');
    setNewMessage('');
    onSaveNotice();
  };

  const handleDelete = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    onSaveNotice();
  };

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    onSaveNotice();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Timed Broadcasts & Stream Automations</h2>
            <p className="text-xs text-slate-400">
              Periodically send announcements, Discord links, and channel point reminders to YouTube chat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Automations List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {automations.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border transition-all ${
                a.enabled
                  ? 'bg-slate-900/90 border-slate-800 shadow-md'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-xs">{a.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/40 font-mono">
                      Every {a.intervalMinutes} Minutes
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono leading-relaxed">
                    {a.messageTemplate}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onBroadcastNow(a.messageTemplate)}
                    className="p-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Send to chat now"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Now</span>
                  </button>
                  <button
                    onClick={() => handleToggle(a.id)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      a.enabled ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {a.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Add Automation (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-teal-400" />
            <span>New Timed Broadcast</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Automation Title</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="e.g. Subscribe Reminder"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Broadcast Interval (Minutes)</label>
              <input
                type="number"
                value={newInterval}
                onChange={(e) => setNewInterval(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Message Template</label>
              <textarea
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
                placeholder="📢 Don't forget to like and subscribe to support the stream!"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Automation</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
