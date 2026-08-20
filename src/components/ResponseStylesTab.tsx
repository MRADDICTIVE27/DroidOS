import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Bot,
  Flame,
  MessageSquare,
  RefreshCw,
  Zap,
  Sliders,
  Check,
  Smile,
  Shield,
  Send
} from 'lucide-react';
import { PersonalityResponseType, ResponseStyleDefinition } from '../types';
import { substituteTokens } from '../services/botEngine';

interface ResponseStylesTabProps {
  responseStyles: Record<PersonalityResponseType, ResponseStyleDefinition>;
  setResponseStyles: React.Dispatch<
    React.SetStateAction<Record<PersonalityResponseType, ResponseStyleDefinition>>
  >;
  onSaveNotice: () => void;
}

const STYLE_META: {
  id: PersonalityResponseType;
  name: string;
  icon: string;
  color: string;
  desc: string;
}[] = [
  {
    id: 'roast',
    name: 'Roast & Banter',
    icon: '🔥',
    color: 'from-red-600 to-orange-600 border-red-500/40 text-red-300',
    desc: 'Savage comedic burns that weaponize the viewer’s memory facts & fail moments'
  },
  {
    id: 'friendly',
    name: 'Friendly & Welcoming',
    icon: '😊',
    color: 'from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-300',
    desc: 'Warm, positive, uplifting and community-oriented praise'
  },
  {
    id: 'calm',
    name: 'Calm & Zen',
    icon: '🍃',
    color: 'from-teal-600 to-cyan-600 border-teal-500/40 text-teal-300',
    desc: 'Tranquil mindfulness, deep breaths, grounding and chill vibes'
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic & Dry',
    icon: '🙄',
    color: 'from-purple-600 to-indigo-600 border-purple-500/40 text-purple-300',
    desc: 'Dry wit, playful cynicism, dramatic eye-rolls and irony'
  },
  {
    id: 'stubborn',
    name: 'Stubborn & Obstinate',
    icon: '😤',
    color: 'from-amber-600 to-yellow-600 border-amber-500/40 text-amber-300',
    desc: 'Refuses to concede arguments, obstinate opinions and robot pride'
  },
  {
    id: 'hopeful',
    name: 'Hopeful & Inspiring',
    icon: '✨',
    color: 'from-cyan-600 to-blue-600 border-cyan-500/40 text-cyan-300',
    desc: 'Unshakable optimism, motivation, cheerleading and big dreams'
  },
  {
    id: 'annoyed',
    name: 'Annoyed & Grumpy',
    icon: '😒',
    color: 'from-orange-600 to-rose-600 border-orange-500/40 text-orange-300',
    desc: 'Comically impatient, sighing dramatically and tired of questions'
  },
  {
    id: 'default',
    name: 'Default Adaptive',
    icon: '🤖',
    color: 'from-slate-600 to-slate-700 border-slate-600 text-slate-300',
    desc: 'Standard role-based responses and adaptive stream replies'
  }
];

export const ResponseStylesTab: React.FC<ResponseStylesTabProps> = ({
  responseStyles,
  setResponseStyles,
  onSaveNotice
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PersonalityResponseType>('roast');
  const [activeCategory, setActiveCategory] = useState<'greeting' | 'chat' | 'memory'>('memory');
  const [newTemplateInput, setNewTemplateInput] = useState<string>('');

  // Live Test Engine State
  const [testUser, setTestUser] = useState<string>('RoastTarget99');
  const [testMemory, setTestMemory] = useState<string>('missed 12 sniper shots in a row yesterday');
  const [liveTestOutput, setLiveTestOutput] = useState<string | null>(null);

  const currentDef = responseStyles[selectedStyle] || responseStyles.roast;
  const currentMeta = STYLE_META.find((m) => m.id === selectedStyle) || STYLE_META[0];

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateInput.trim()) return;

    setResponseStyles((prev) => {
      const existing = prev[selectedStyle] || {
        type: selectedStyle,
        label: currentMeta.name,
        systemPromptInstruction: '',
        greetingResponses: [],
        chatResponses: [],
        memoryInfusedResponses: []
      };

      const updated = { ...existing };
      if (activeCategory === 'greeting') {
        updated.greetingResponses = [...updated.greetingResponses, newTemplateInput.trim()];
      } else if (activeCategory === 'chat') {
        updated.chatResponses = [...updated.chatResponses, newTemplateInput.trim()];
      } else {
        updated.memoryInfusedResponses = [
          ...updated.memoryInfusedResponses,
          newTemplateInput.trim()
        ];
      }

      return { ...prev, [selectedStyle]: updated };
    });

    setNewTemplateInput('');
    onSaveNotice();
  };

  const handleDeleteTemplate = (category: 'greeting' | 'chat' | 'memory', index: number) => {
    setResponseStyles((prev) => {
      const existing = prev[selectedStyle];
      if (!existing) return prev;

      const updated = { ...existing };
      if (category === 'greeting') {
        updated.greetingResponses = updated.greetingResponses.filter((_, i) => i !== index);
      } else if (category === 'chat') {
        updated.chatResponses = updated.chatResponses.filter((_, i) => i !== index);
      } else {
        updated.memoryInfusedResponses = updated.memoryInfusedResponses.filter(
          (_, i) => i !== index
        );
      }

      return { ...prev, [selectedStyle]: updated };
    });
    onSaveNotice();
  };

  const handleUpdateSystemInstruction = (val: string) => {
    setResponseStyles((prev) => ({
      ...prev,
      [selectedStyle]: {
        ...prev[selectedStyle],
        systemPromptInstruction: val
      }
    }));
    onSaveNotice();
  };

  const handleRunLiveTest = () => {
    const pool =
      activeCategory === 'greeting'
        ? currentDef.greetingResponses
        : activeCategory === 'chat'
        ? currentDef.chatResponses
        : currentDef.memoryInfusedResponses;

    const chosen =
      pool && pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : `Hello @{username}! Tone set to ${selectedStyle}.`;

    const rendered = substituteTokens(chosen, {
      username: testUser.trim() || 'Viewer',
      botName: 'DroidBot',
      streamerName: 'Streamer',
      channelName: 'LiveChannel',
      userPoints: 1250,
      currencyName: 'DroidCoins',
      responseType: selectedStyle,
      memoryFacts: [testMemory.trim() || 'stream chatter']
    });

    setLiveTestOutput(rendered);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bot Personality Styles & Memory Engine</h2>
            <p className="text-xs text-slate-400">
              Customize distinct response templates (Roast, Calm, Stubborn, Sarcastic, Hopeful, Annoyed, Friendly) and memory integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
            8 Style Profiles Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Style Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider px-1">
            Choose Personality Style
          </label>
          <div className="space-y-2">
            {STYLE_META.map((meta) => {
              const isSelected = selectedStyle === meta.id;
              const def = responseStyles[meta.id];
              const totalCount =
                (def?.greetingResponses?.length || 0) +
                (def?.chatResponses?.length || 0) +
                (def?.memoryInfusedResponses?.length || 0);

              return (
                <button
                  key={meta.id}
                  onClick={() => {
                    setSelectedStyle(meta.id);
                    setLiveTestOutput(null);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500 shadow-xl'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{meta.name}</span>
                        {meta.id === 'roast' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800/40">
                            Savage
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{meta.desc}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    {totalCount} lines
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Editor & Template Manager (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col text-xs">
          {/* Active Style Title */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentMeta.icon}</span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{currentMeta.name} Responses</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 uppercase font-mono">
                    ID: {currentMeta.id}
                  </span>
                </h3>
                <p className="text-slate-400 text-xs">{currentMeta.desc}</p>
              </div>
            </div>
          </div>

          {/* AI System Instruction Prompt for this Persona */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>AI Persona Guidance (Gemini Instruction)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Auto-included in AI queries</span>
            </div>
            <textarea
              rows={2}
              value={currentDef?.systemPromptInstruction || ''}
              onChange={(e) => handleUpdateSystemInstruction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              placeholder="System prompt instruction for this persona..."
            />
          </div>

          {/* Category Tabs: Memory Infused vs General Chat vs Greetings */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveCategory('memory')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                activeCategory === 'memory'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Memory-Infused Responses ({currentDef?.memoryInfusedResponses?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveCategory('chat')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                activeCategory === 'chat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat / Questions ({currentDef?.chatResponses?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveCategory('greeting')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                activeCategory === 'greeting'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Greetings ({currentDef?.greetingResponses?.length || 0})</span>
            </button>
          </div>

          {/* Add Template Form */}
          <form onSubmit={handleAddTemplate} className="space-y-2">
            <label className="block text-slate-400 font-medium text-[11px]">
              Add Response Template (Supports <code className="text-amber-400">{`{username}`}</code>, <code className="text-purple-400">{`{custom_fact}`}</code>, <code className="text-cyan-400">{`{streamer_name}`}</code>, <code className="text-emerald-400">{`{user_points}`}</code>):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTemplateInput}
                onChange={(e) => setNewTemplateInput(e.target.value)}
                placeholder={
                  activeCategory === 'memory'
                    ? "e.g. Hey @{username}, remember when you '{custom_fact}'? Chat hasn't forgotten! 😂💀"
                    : "e.g. @{username} asks another question... did your brain lag again? 🔥"
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Template</span>
              </button>
            </div>
          </form>

          {/* Template List */}
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {(() => {
              const list =
                activeCategory === 'greeting'
                  ? currentDef?.greetingResponses || []
                  : activeCategory === 'chat'
                  ? currentDef?.chatResponses || []
                  : currentDef?.memoryInfusedResponses || [];

              if (list.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                    No templates in this category yet. Add one above!
                  </div>
                );
              }

              return list.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 group hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-slate-200 text-xs font-mono leading-relaxed">{item}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Index #{idx + 1}</span>
                      {item.includes('{custom_fact}') && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          Uses Memory Fact
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTemplate(activeCategory, idx)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer shrink-0 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ));
            })()}
          </div>

          {/* Interactive Live Persona Tester */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Live Persona Simulator</span>
              </span>
              <button
                type="button"
                onClick={handleRunLiveTest}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 shadow-md shadow-amber-600/20"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test Current Persona</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Test Viewer Username</label>
                <input
                  type="text"
                  value={testUser}
                  onChange={(e) => setTestUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Simulated Memory Fact</label>
                <input
                  type="text"
                  value={testMemory}
                  onChange={(e) => setTestMemory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {liveTestOutput && (
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 font-mono text-xs leading-relaxed animate-fadeIn">
                <span className="font-bold text-amber-400 block text-[10px] mb-1">
                  🤖 Simulated Output for {currentMeta.name}:
                </span>
                {liveTestOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
