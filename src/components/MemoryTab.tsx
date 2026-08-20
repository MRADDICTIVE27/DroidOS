import React, { useState } from 'react';
import { Brain, Plus, Trash2, Check, Sparkles, User, Database, Search } from 'lucide-react';
import { ViewerProfile, ViewerMemoryItem } from '../types';

interface MemoryTabProps {
  profiles: ViewerProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<ViewerProfile[]>>;
  onSaveNotice: () => void;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({
  profiles,
  setProfiles,
  onSaveNotice
}) => {
  const [selectedUser, setSelectedUser] = useState<string>(profiles[0]?.username || '');
  const [newFact, setNewFact] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const activeProfile = profiles.find((p) => p.username === selectedUser) || profiles[0];

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim() || !activeProfile) return;

    const memoryItem: ViewerMemoryItem = {
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0],
      fact: newFact.trim(),
      addedBy: 'manual'
    };

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfile.id
          ? {
              ...p,
              customFacts: [...p.customFacts, newFact.trim()],
              memoryItems: [...(p.memoryItems || []), memoryItem]
            }
          : p
      )
    );

    setNewFact('');
    onSaveNotice();
  };

  const handleDeleteFact = (factIndex: number) => {
    if (!activeProfile) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfile.id
          ? {
              ...p,
              customFacts: p.customFacts.filter((_, i) => i !== factIndex),
              memoryItems: (p.memoryItems || []).filter((_, i) => i !== factIndex)
            }
          : p
      )
    );
    onSaveNotice();
  };

  const filteredProfiles = profiles.filter((p) =>
    p.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Viewer Memory & AI Knowledge Base</h2>
            <p className="text-xs text-slate-400">
              Long-term persistent facts referenced in custom bot replies and Gemini AI context
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Viewer Selector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">Select Viewer Profile</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search viewers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[440px] scrollbar-thin flex-1">
            {filteredProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedUser(p.username)}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  activeProfile?.id === p.id
                    ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-md'
                    : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {p.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{p.username}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.customFacts?.length || 0} memory facts
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {p.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Memory Facts for Selected Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col">
          {activeProfile ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                    {activeProfile.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{activeProfile.username}</span>
                      <span className="text-xs font-normal text-slate-400">({activeProfile.role})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Balance: <strong className="text-amber-300">{activeProfile.points.toLocaleString()} pts</strong> • Moderation Level: <strong className="text-purple-300">Level {activeProfile.moderationLevel}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Fact Form */}
              <form onSubmit={handleAddFact} className="flex gap-2">
                <input
                  type="text"
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder={`Add a memory fact about @${activeProfile.username} (e.g. loves Minecraft, VIP since Jan)`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Remember</span>
                </button>
              </form>

              {/* Facts List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] scrollbar-thin">
                {activeProfile.customFacts && activeProfile.customFacts.length > 0 ? (
                  activeProfile.customFacts.map((fact, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-slate-200">{fact}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteFact(index)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                        title="Delete fact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No custom memory facts recorded yet for this viewer.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a viewer from the left column to inspect and add memory facts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
