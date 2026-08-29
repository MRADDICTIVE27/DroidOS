import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  Send,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  Radio,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { AutomationTimer } from '../types';
import { soundSynth } from '../services/soundSynthesizer';

interface AutomationTimersTabProps {
  timers: AutomationTimer[];
  onAddTimer: (timer: AutomationTimer) => void;
  onUpdateTimer: (timer: AutomationTimer) => void;
  onDeleteTimer: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onTriggerTimerNow: (timer: AutomationTimer) => void;
}

export const AutomationTimersTab: React.FC<AutomationTimersTabProps> = ({
  timers,
  onAddTimer,
  onUpdateTimer,
  onDeleteTimer,
  onToggleTimer,
  onTriggerTimerNow
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTimer, setEditingTimer] = useState<AutomationTimer | null>(null);
  const [globalTimersActive, setGlobalTimersActive] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(15);
  const [minChatLines, setMinChatLines] = useState<number>(5);
  const [soundEffect, setSoundEffect] = useState<string>('none');
  const [sendAs, setSendAs] = useState<'bot' | 'host'>('bot');

  const openNewModal = () => {
    setEditingTimer(null);
    setName('');
    setMessage('');
    setIntervalMinutes(15);
    setMinChatLines(5);
    setSoundEffect('none');
    setSendAs('bot');
    setShowModal(true);
  };

  const openEditModal = (timer: AutomationTimer) => {
    setEditingTimer(timer);
    setName(timer.name);
    setMessage(timer.message);
    setIntervalMinutes(timer.intervalMinutes);
    setMinChatLines(timer.minChatLines);
    setSoundEffect(timer.soundEffect || 'none');
    setSendAs(timer.sendAs || 'bot');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim() || !message.trim()) return;

    const timerData: AutomationTimer = {
      id: editingTimer ? editingTimer.id : `timer-${Date.now()}`,
      name: name.trim(),
      message: message.trim(),
      intervalMinutes,
      minChatLines,
      enabled: editingTimer ? editingTimer.enabled : true,
      lastTriggered: editingTimer ? editingTimer.lastTriggered : 'Never',
      soundEffect: soundEffect !== 'none' ? soundEffect : undefined,
      sendAs,
      linesSinceLastPost: 0
    };

    if (editingTimer) {
      onUpdateTimer(timerData);
    } else {
      onAddTimer(timerData);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-purple-950/40 border border-amber-500/20 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Timers & Automation Commands</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {(timers?.filter((t) => t.enabled)?.length ?? 0)}/{(timers?.length ?? 0)} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically post schedule updates, Discord links, Ko-fi reminders, and rules at recurring intervals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setGlobalTimersActive((prev) => !prev)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                globalTimersActive
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                  : 'bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/30'
              }`}
            >
              {globalTimersActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{globalTimersActive ? 'Engine Running' : 'Engine Paused'}</span>
            </button>

            <button
              onClick={openNewModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 border border-white/20 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice & Smart Line Counter Info */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-start gap-3 text-xs text-slate-300">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-white">Smart Anti-Spam Line Counter</span>
          <p className="text-slate-400 leading-relaxed">
            Timers won&apos;t spam a quiet chat. Each timer checks if your live chat has reached the minimum line threshold (e.g. at least 5 new chat messages) before broadcasting its automated announcement.
          </p>
        </div>
      </div>

      {/* Timers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timers.map((timer) => (
          <div
            key={timer.id}
            className={`rounded-2xl border p-5 backdrop-blur-xl transition-all flex flex-col justify-between space-y-4 ${
              timer.enabled
                ? 'bg-white/[0.03] border-white/10 hover:border-amber-500/40'
                : 'bg-slate-950/40 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{timer.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      timer.enabled ? 'bg-amber-600' : 'bg-slate-700'
                    }`}
                    title={timer.enabled ? 'Disable Timer' : 'Enable Timer'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        timer.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs text-amber-200/90 leading-relaxed font-sans">
                {timer.message}
              </div>

              {/* Badges / Stats */}
              <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-400">
                <span className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Every {timer.intervalMinutes} mins</span>
                </span>

                <span className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Min {timer.minChatLines} chat lines</span>
                </span>

                {timer.soundEffect && (
                  <span className="flex items-center gap-1 bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="capitalize">{timer.soundEffect}</span>
                  </span>
                )}
                
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                  timer.sendAs === 'host' 
                    ? 'bg-red-500/10 text-red-300 border-red-500/20' 
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}>
                  <span className="capitalize">{timer.sendAs || 'bot'}</span>
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Last broadcast: <strong className="text-slate-400">{timer.lastTriggered || 'Never'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (timer.soundEffect) soundSynth.play(timer.soundEffect as any);
                    onTriggerTimerNow(timer);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Broadcast this message to chat right now"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Now</span>
                </button>

                <button
                  onClick={() => openEditModal(timer)}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteTimer(timer.id)}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingTimer ? 'Edit Timer' : 'Create Automation Timer'}
                  </h3>
                  <p className="text-xs text-slate-400">Post automated messages on a recurring schedule</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Timer Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Discord Community Reminder"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Message Content *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Join our community Discord: https://discord.gg/..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Interval (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Chat Lines Requirement</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={minChatLines}
                    onChange={(e) => setMinChatLines(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Sound Synthesizer Trigger</label>
                <select
                  value={soundEffect}
                  onChange={(e) => setSoundEffect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="none">No Sound</option>
                  <option value="coin">Coin Synthesizer Chime</option>
                  <option value="airhorn">Stream Airhorn</option>
                  <option value="shoutout">Shoutout Chime</option>
                  <option value="victory">Victory Fanfare</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Send Timer As</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSendAs('bot')}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      sendAs === 'bot'
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    Bot Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendAs('host')}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      sendAs === 'host'
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    Host Account
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
                disabled={!name.trim() || !message.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                {editingTimer ? 'Save Changes' : 'Create Timer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
