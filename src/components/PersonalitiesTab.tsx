import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Save,
  Check,
  Send,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  FolderOpen,
  Eye,
  Sliders,
  Tag,
  ListFilter
} from 'lucide-react';
import { BotPersonality, ViewerProfile, MoodQuestionTrigger } from '../types';
import { interpolateTemplate } from '../services/botEngine';

interface PersonalitiesTabProps {
  personalities: BotPersonality[];
  activePersonality: BotPersonality;
  onSelectPersonality: (p: BotPersonality) => void;
  onUpdatePersonality: (p: BotPersonality) => void;
  viewers: ViewerProfile[];
  streamerName: string;
}

export const PersonalitiesTab: React.FC<PersonalitiesTabProps> = ({
  personalities,
  activePersonality,
  onSelectPersonality,
  onUpdatePersonality,
  viewers,
  streamerName
}) => {
  const [editingPersonality, setEditingPersonality] = useState<BotPersonality>(activePersonality);
  const [activeSubView, setActiveSubView] = useState<'questions' | 'chat' | 'memory' | 'greetings'>('questions');
  const [isSaved, setIsSaved] = useState(false);

  // New item inputs
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionKeywords, setNewQuestionKeywords] = useState('');
  const [newQuestionAnswer, setNewQuestionAnswer] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<'gaming' | 'channel' | 'economy' | 'advice' | 'banter' | 'general' | 'lore'>('general');

  const [newChatResponse, setNewChatResponse] = useState('');
  const [newGreeting, setNewGreeting] = useState('');
  const [newMemoryResponse, setNewMemoryResponse] = useState('');

  // Simulator state
  const [simTestInput, setSimTestInput] = useState('What game are you playing?');
  const [simSelectedViewer, setSimSelectedViewer] = useState<ViewerProfile>(viewers[0] || { username: 'Chatter', displayName: 'Chatter' });
  const [simReplies, setSimReplies] = useState<Array<{ id: string; user: string; botReply: string; triggerType?: string }>>([
    {
      id: 'sim-1',
      user: 'What game are you playing?',
      triggerType: 'Question Trigger (22 Matrix)',
      botReply: interpolateTemplate(
        activePersonality.questionTriggers?.[0]?.answer || (activePersonality.chatResponses || [])[0] || 'Good question!',
        {
          username: viewers[0]?.displayName || 'TopViewer',
          streamer_name: streamerName,
          custom_fact: viewers[0]?.customFacts?.[0] || 'Won the community duel champion title',
          user_points: viewers[0]?.points || 12500
        }
      )
    }
  ]);

  const handleSelect = (p: BotPersonality) => {
    onSelectPersonality(p);
    setEditingPersonality(p);
  };

  const handleSave = () => {
    onUpdatePersonality(editingPersonality);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddQuestionTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newQuestionAnswer.trim()) return;

    const kwArray = newQuestionKeywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    if (!kwArray.length) {
      kwArray.push(newQuestionText.toLowerCase().trim());
    }

    const newTrigger: MoodQuestionTrigger = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      keywords: kwArray,
      answer: newQuestionAnswer.trim(),
      category: newQuestionCategory
    };

    setEditingPersonality({
      ...editingPersonality,
      questionTriggers: [...(editingPersonality.questionTriggers || []), newTrigger]
    });

    setNewQuestionText('');
    setNewQuestionKeywords('');
    setNewQuestionAnswer('');
  };

  const handleSimulateTest = (customQuery?: string) => {
    const query = (customQuery !== undefined ? customQuery : simTestInput).trim();
    if (!query) return;

    const lower = query.toLowerCase();
    const fact = simSelectedViewer.customFacts?.[0] || 'active chatter in the stream';

    // 1. Check if matches any of the 22 Question Triggers for this mood
    let matchedTrigger: MoodQuestionTrigger | undefined;
    if (editingPersonality.questionTriggers?.length) {
      matchedTrigger = editingPersonality.questionTriggers.find((qt) =>
        qt.keywords.some((kw) => lower.includes(kw.toLowerCase()) || lower === kw.toLowerCase())
      );
    }

    let reply = '';
    let triggerType = 'General Chat Response';

    if (matchedTrigger) {
      triggerType = `Question Trigger (${matchedTrigger.category?.toUpperCase() || 'GENERAL'})`;
      reply = interpolateTemplate(matchedTrigger.answer, {
        username: simSelectedViewer.displayName || 'Chatter',
        streamer_name: streamerName,
        custom_fact: fact,
        user_points: simSelectedViewer.points || 100
      });

      // Infuse memory if applicable
      if (simSelectedViewer.customFacts?.length && Math.random() < 0.45) {
        reply += ` (Also, remembering that you ${fact}, I had to make sure you got the answer!)`;
      }
    } else {
      // Memory or chat pool
      const useMemory = Math.random() > 0.4 && (editingPersonality.memoryInfusedResponses?.length ?? 0) > 0;
      const pool = useMemory
        ? editingPersonality.memoryInfusedResponses
        : (editingPersonality.chatResponses || []).length
        ? editingPersonality.chatResponses
        : editingPersonality.greetingResponses;

      const template = pool[Math.floor(Math.random() * pool.length)] || '🤖 Standby for stream response!';
      triggerType = useMemory ? 'Memory-Infused Context' : 'Mood Chat Banter';

      reply = interpolateTemplate(template, {
        username: simSelectedViewer.displayName || 'Chatter',
        streamer_name: streamerName,
        custom_fact: fact,
        user_points: simSelectedViewer.points || 100
      });
    }

    setSimReplies((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}`,
        user: query,
        botReply: reply,
        triggerType
      }
    ]);
    setSimTestInput('');
  };

  const questionTriggers = editingPersonality.questionTriggers || [];
  const chatResponses = editingPersonality.chatResponses || [];
  const memoryResponses = editingPersonality.memoryInfusedResponses || [];
  const greetingResponses = editingPersonality.greetingResponses || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20 backdrop-blur-md">
            {activePersonality.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold text-white">Bot Personality Matrix & Memory Engine</h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                ACTIVE MOOD: {activePersonality.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                44+ Mood Triggers & Memories Loaded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Each personality contains 22 specific Question Triggers + 22 Chat Responses + 12 Viewer Memory Responses + 10 Greetings.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Saved All Changes!' : 'Save Personality Config'}</span>
        </button>
      </div>

      {/* 8 Personality Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {personalities.map((p) => {
          const isActive = p.id === activePersonality.id;
          const isBeingEdited = p.id === editingPersonality.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative backdrop-blur-2xl text-center ${
                isActive
                  ? 'bg-purple-500/20 border-purple-400/60 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/50'
                  : isBeingEdited
                  ? 'bg-white/[0.08] border-white/25 ring-1 ring-white/20'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-2xl">{p.icon}</div>
              <div>
                <h3 className="font-extrabold text-xs text-white truncate">{p.label.split(' ')[0]}</h3>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.id}</p>
              </div>
              {isActive && (
                <div className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-500/40 text-purple-200 border border-purple-400/40 tracking-wider">
                  ACTIVE
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor & Simulator 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sub-views (Questions, Chat, Memory, Greetings) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-view Navigation Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveSubView('questions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'questions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers ({questionTriggers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'chat'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Responses ({chatResponses.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('memory')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'memory'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Memory Responses ({memoryResponses.length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('greetings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'greetings'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Greetings ({greetingResponses.length})</span>
            </button>
          </div>

          {/* 1. Questions & Answers View */}
          {activeSubView === 'questions' && (
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    Question & Answer Knowledge Base for "{editingPersonality.label}"
                  </h3>
                  <p className="text-xs text-slate-400">
                    When viewers ask these questions, the bot responds in this mood's unique voice and perspective (Add unlimited custom Q&As)
                  </p>
                </div>
                <span className="text-xs text-purple-300 font-mono font-semibold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-400/30">
                  {questionTriggers.length} Questions (Unlimited)
                </span>
              </div>

              {/* Question list */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {questionTriggers.map((qt, idx) => (
                  <div
                    key={qt.id || idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">#{idx + 1} {qt.question}</span>
                          {qt.category && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/[0.05] text-slate-300 border border-white/10">
                              {qt.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-500">Keywords:</span>
                          {qt.keywords.map((kw, ki) => (
                            <span key={ki} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSimulateTest(qt.question)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/[0.05] hover:bg-purple-600/30 text-purple-300 border border-purple-400/30 transition-colors cursor-pointer"
                          title="Test in Simulator"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => {
                            const updated = questionTriggers.filter((_, i) => i !== idx);
                            setEditingPersonality({ ...editingPersonality, questionTriggers: updated });
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 font-sans">
                      <span className="font-bold text-purple-300">Answer: </span>
                      {qt.answer}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Question Trigger */}
              <form onSubmit={handleAddQuestionTrigger} className="pt-3 border-t border-white/[0.08] space-y-3">
                <div className="text-xs font-bold text-slate-300">Add Custom Question Trigger</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Question prompt (e.g. Can you play Minecraft?)"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="sm:col-span-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50"
                  />
                  <select
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400/50"
                  >
                    <option value="general" className="bg-slate-900">General</option>
                    <option value="gaming" className="bg-slate-900">Gaming</option>
                    <option value="channel" className="bg-slate-900">Channel</option>
                    <option value="economy" className="bg-slate-900">Economy</option>
                    <option value="advice" className="bg-slate-900">Advice</option>
                    <option value="banter" className="bg-slate-900">Banter</option>
                    <option value="lore" className="bg-slate-900">Lore</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Keywords (comma separated: play minecraft, minecraft stream, start mc)"
                  value={newQuestionKeywords}
                  onChange={(e) => setNewQuestionKeywords(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mood Answer (use @{username}, {streamer_name}, {user_points})..."
                    value={newQuestionAnswer}
                    onChange={(e) => setNewQuestionAnswer(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Chat Responses View */}
          {activeSubView === 'chat' && (
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Chat Responses & Banter Engine</h3>
                  <p className="text-xs text-slate-400">Randomized replies for chat interactions, remarks, and spontaneous conversation (Add unlimited)</p>
                </div>
                <span className="text-xs text-purple-300 font-mono font-semibold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-400/30">
                  {chatResponses.length} Templates (Unlimited)
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {chatResponses.map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-200 backdrop-blur-md">
                    <span className="text-slate-500 font-mono text-[10px] w-6">#{idx + 1}</span>
                    <span className="flex-1 font-sans">{resp}</span>
                    <button
                      onClick={() => {
                        const updated = chatResponses.filter((_, i) => i !== idx);
                        setEditingPersonality({ ...editingPersonality, chatResponses: updated });
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add new chat response (use {username}, {streamer_name}, {user_points})..."
                  value={newChatResponse}
                  onChange={(e) => setNewChatResponse(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
                />
                <button
                  onClick={() => {
                    if (!newChatResponse.trim()) return;
                    setEditingPersonality({
                      ...editingPersonality,
                      chatResponses: [...chatResponses, newChatResponse]
                    });
                    setNewChatResponse('');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          )}

          {/* 3. Memory Responses View */}
          {activeSubView === 'memory' && (
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Memory-Infused Viewer Responses (Unlimited)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Responses that dynamically weave individual viewer memory facts (<code className="text-purple-300">{'{custom_fact}'}</code>) into conversation!
                  </p>
                </div>
                <span className="text-xs text-purple-300 font-mono font-semibold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-400/30">
                  {memoryResponses.length} Memories (Unlimited)
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {memoryResponses.map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 backdrop-blur-md">
                    <span className="text-purple-400 font-mono text-[10px] w-6">#{idx + 1}</span>
                    <span className="flex-1 font-sans">{resp}</span>
                    <button
                      onClick={() => {
                        const updated = memoryResponses.filter((_, i) => i !== idx);
                        setEditingPersonality({ ...editingPersonality, memoryInfusedResponses: updated });
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add memory response (e.g. @{username}, remembering that you '{custom_fact}'...)"
                  value={newMemoryResponse}
                  onChange={(e) => setNewMemoryResponse(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
                />
                <button
                  onClick={() => {
                    if (!newMemoryResponse.trim()) return;
                    setEditingPersonality({
                      ...editingPersonality,
                      memoryInfusedResponses: [...memoryResponses, newMemoryResponse]
                    });
                    setNewMemoryResponse('');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          )}

          {/* 4. Greetings View */}
          {activeSubView === 'greetings' && (
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Greeting & Welcome Responses</h3>
                  <p className="text-xs text-slate-400">Triggered when viewers send their first message in chat or enter the broadcast (Add unlimited)</p>
                </div>
                <span className="text-xs text-purple-300 font-mono font-semibold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-400/30">
                  {greetingResponses.length} Greetings (Unlimited)
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {greetingResponses.map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-200 backdrop-blur-md">
                    <span className="text-slate-500 font-mono text-[10px] w-6">#{idx + 1}</span>
                    <span className="flex-1 font-sans">{resp}</span>
                    <button
                      onClick={() => {
                        const updated = greetingResponses.filter((_, i) => i !== idx);
                        setEditingPersonality({ ...editingPersonality, greetingResponses: updated });
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add greeting (use @{username}, {streamer_name})..."
                  value={newGreeting}
                  onChange={(e) => setNewGreeting(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
                />
                <button
                  onClick={() => {
                    if (!newGreeting.trim()) return;
                    setEditingPersonality({
                      ...editingPersonality,
                      greetingResponses: [...greetingResponses, newGreeting]
                    });
                    setNewGreeting('');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Persona Sandbox & Quick 22 Question Selector */}
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-4 flex flex-col h-full">
          <div className="border-b border-white/[0.08] pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Live Persona Sandbox
              </h3>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                {editingPersonality.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Test how the bot replies with memories & 22 mood questions</p>
          </div>

          {/* Viewer selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Simulate As Viewer:</label>
            <select
              value={simSelectedViewer.username}
              onChange={(e) => {
                const found = viewers.find((v) => v.username === e.target.value);
                if (found) setSimSelectedViewer(found);
              }}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
            >
              {viewers.map((v) => (
                <option key={v.username} value={v.username} className="bg-slate-900 text-white">
                  {v.displayName} — {v.customFacts?.[0] ? `[Memory: ${v.customFacts[0]}]` : '[No memory]'}
                </option>
              ))}
            </select>
            {simSelectedViewer.customFacts?.[0] && (
              <div className="text-[10px] text-purple-300 flex items-center gap-1 bg-purple-500/10 p-1.5 rounded-lg border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Active Memory: "{simSelectedViewer.customFacts[0]}"</span>
              </div>
            )}
          </div>

          {/* Quick 22 Question Trigger dropdown */}
          {questionTriggers.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Quick Test (Pick one of the 22 Questions):</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleSimulateTest(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-400/50"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">⚡ Pick a question trigger to test...</option>
                {questionTriggers.map((qt, idx) => (
                  <option key={qt.id || idx} value={qt.question} className="bg-slate-900 text-white">
                    #{idx + 1}: {qt.question}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sandbox Dialogue */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-80 p-3 rounded-xl bg-white/[0.02] border border-white/10">
            {simReplies.map((item) => (
              <div key={item.id} className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-400">{simSelectedViewer.displayName}</span>
                    <span>Chat Input</span>
                  </div>
                  {item.user}
                </div>
                <div className="p-2.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-purple-400 mb-1">
                    <span className="font-bold flex items-center gap-1">
                      <Bot className="w-3 h-3" /> DroidBot ({editingPersonality.label})
                    </span>
                    {item.triggerType && (
                      <span className="font-mono text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300 border border-purple-400/30">
                        {item.triggerType}
                      </span>
                    )}
                  </div>
                  <p className="font-sans leading-relaxed">{item.botReply}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSimulateTest(); }} className="flex gap-2 pt-2 border-t border-white/[0.08]">
            <input
              type="text"
              placeholder="Ask custom question or talk to bot..."
              value={simTestInput}
              onChange={(e) => setSimTestInput(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50 backdrop-blur-md"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
