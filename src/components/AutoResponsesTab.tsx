import React, { useState } from 'react';
import {
  MessageSquareCode,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  Check,
  X,
  Play,
  HelpCircle,
  Hash,
  ShieldCheck,
  Sliders,
  Send,
  Zap,
  Activity,
  Shuffle,
  Bot,
  Layers,
  Sparkle,
  BookmarkCheck
} from 'lucide-react';
import { AutoResponse, BotPersonality, UserRole } from '../types';

interface AutoResponsesTabProps {
  responses: AutoResponse[];
  onAddResponse: (resp: AutoResponse) => void;
  onUpdateResponse: (resp: AutoResponse) => void;
  onDeleteResponse: (id: string) => void;
  onToggleResponse: (id: string) => void;
  streamerName: string;
  gameCategory: string;
  personalities?: BotPersonality[];
}

// Pre-existing Curated Response Profiles & Templates
const PRESET_PROFILES = [
  {
    id: 'profile_game_info',
    name: 'Game & Setup FAQ',
    triggerType: 'contains' as const,
    patterns: ['what game is this', 'what game', 'game name', 'what are you playing'],
    mode: 'random_pool' as const,
    pool: [
      '🎮 Currently playing {game_name}! Drop a follow if you like high energy gameplay!',
      '🕹️ We are broadcasting {game_name} today! Glad you stopped by, {user}!',
      '🔥 Live on {game_name}! Feel free to ask questions about our build and loadout!'
    ]
  },
  {
    id: 'profile_socials',
    name: 'Socials & Discord Community',
    triggerType: 'contains' as const,
    patterns: ['discord', 'socials', 'twitter', 'youtube', 'community'],
    mode: 'single' as const,
    response: '🌐 Join our community Discord: discord.gg/streamers • Follow on Twitter @{streamer_name} for stream updates!'
  },
  {
    id: 'profile_schedule',
    name: 'Stream Schedule & Hours',
    triggerType: 'contains' as const,
    patterns: ['schedule', 'when do you stream', 'stream times', 'days live'],
    mode: 'random_pool' as const,
    pool: [
      '📅 We stream Mon-Fri starting at 6 PM EST! Turn on notifications so you never miss a drop!',
      '⏰ Live every weekday evening! Check the schedule panel right below the stream!'
    ]
  },
  {
    id: 'profile_hype',
    name: 'Hype & Celebration Waves',
    triggerType: 'contains' as const,
    patterns: ['hype', 'lets go', 'gg', 'w play', 'clutch'],
    mode: 'random_pool' as const,
    pool: [
      '🔥 LETS GO CHAT! The hype is REAL! 🚀🎉',
      '⚡ W PLAY! Chat spams Ws for {user} and the squad! 👑',
      '💥 MAXIMUM OVERDRIVE! Big plays only in this channel! 🔥'
    ]
  },
  {
    id: 'profile_roast_banter',
    name: 'Sarcastic Banter & Roast',
    triggerType: 'contains' as const,
    patterns: ['you suck', 'bad aim', 'missed', 'whiff', 'skill issue'],
    mode: 'personality_pool' as const,
    personalityId: 'sarcastic',
    pool: [
      '🤖 Error 404: Your opinion was not found in my high-bandwidth database.',
      '🤖 Calculating your gameplay skill... NaN detected. Maybe try practicing in tutorial mode?',
      '🤖 My neural nets detected extreme salt in your message. Drink some water!'
    ]
  },
  {
    id: 'profile_rules',
    name: 'Chat Rules & Moderation',
    triggerType: 'contains' as const,
    patterns: ['rules', 'no spam', 'can i self promote', 'links'],
    mode: 'single' as const,
    response: '📜 Chat Rules: 1. Be respectful to everyone. 2. No hate speech or harassment. 3. No unauthorized links or self-promo. Have fun!'
  }
];

export const AutoResponsesTab: React.FC<AutoResponsesTabProps> = ({
  responses,
  onAddResponse,
  onUpdateResponse,
  onDeleteResponse,
  onToggleResponse,
  streamerName,
  gameCategory,
  personalities = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResp, setEditingResp] = useState<AutoResponse | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'contains' | 'exact' | 'regex' | 'starts_with'>('contains');
  const [patternsInput, setPatternsInput] = useState('');
  const [responseMode, setResponseMode] = useState<'single' | 'random_pool' | 'personality_pool'>('single');
  const [responseMsg, setResponseMsg] = useState('');
  const [poolInput, setPoolInput] = useState('');
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string>(personalities[0]?.id || 'sarcastic');
  const [cooldown, setCooldown] = useState<number>(30);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [triggerOverlay, setTriggerOverlay] = useState(false);
  const [overlayBannerPreset, setOverlayBannerPreset] = useState('xbox');
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlaySubtitle, setOverlaySubtitle] = useState('');

  // Live Pattern Testing Tool State
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ matched: boolean; ruleName?: string; output?: string; mode?: string } | null>(null);

  const openNewModal = () => {
    setEditingResp(null);
    setName('');
    setTriggerType('contains');
    setPatternsInput('');
    setResponseMode('single');
    setResponseMsg('');
    setPoolInput('');
    setSelectedPersonalityId(personalities[0]?.id || 'sarcastic');
    setCooldown(30);
    setCaseSensitive(false);
    setTriggerOverlay(false);
    setOverlayBannerPreset('xbox');
    setOverlayTitle('');
    setOverlaySubtitle('');
    setShowModal(true);
  };

  const openEditModal = (resp: AutoResponse) => {
    setEditingResp(resp);
    setName(resp.name);
    setTriggerType(resp.triggerType);
    setPatternsInput(resp.patterns.join('\n'));
    setResponseMode(resp.responseMode || (resp.responsePool && resp.responsePool.length > 0 ? 'random_pool' : 'single'));
    setResponseMsg(resp.response);
    setPoolInput((resp.responsePool || [resp.response]).join('\n'));
    setSelectedPersonalityId(resp.personalityId || personalities[0]?.id || 'sarcastic');
    setCooldown(resp.cooldownSeconds);
    setCaseSensitive(resp.caseSensitive || false);
    setTriggerOverlay(resp.triggerOverlay || false);
    setOverlayBannerPreset(resp.overlayBannerPreset || 'xbox');
    setOverlayTitle(resp.overlayTitle || '');
    setOverlaySubtitle(resp.overlaySubtitle || '');
    setShowModal(true);
  };

  const handleApplyPresetProfile = (preset: typeof PRESET_PROFILES[0]) => {
    setName(preset.name);
    setTriggerType(preset.triggerType);
    setPatternsInput(preset.patterns.join('\n'));
    setResponseMode(preset.mode);
    if (preset.mode === 'single') {
      setResponseMsg(preset.response || '');
      setPoolInput(preset.response || '');
    } else {
      setPoolInput(preset.pool?.join('\n') || '');
      setResponseMsg(preset.pool?.[0] || '');
    }
    if (preset.personalityId) {
      setSelectedPersonalityId(preset.personalityId);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !patternsInput.trim()) return;

    const patternList = patternsInput
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const poolList = poolInput
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const primaryResponse = responseMode === 'single'
      ? responseMsg.trim()
      : (poolList[0] || responseMsg.trim() || 'Response trigger matched!');

    const responseData: AutoResponse = {
      id: editingResp ? editingResp.id : `resp-${Date.now()}`,
      name: name.trim(),
      triggerType,
      patterns: patternList,
      response: primaryResponse,
      responseMode,
      responsePool: poolList.length > 0 ? poolList : [primaryResponse],
      personalityId: responseMode === 'personality_pool' ? selectedPersonalityId : undefined,
      enabled: editingResp ? editingResp.enabled : true,
      cooldownSeconds: cooldown,
      matchCount: editingResp ? editingResp.matchCount : 0,
      caseSensitive,
      triggerOverlay,
      overlayBannerPreset: triggerOverlay ? overlayBannerPreset : undefined,
      overlayTitle: triggerOverlay ? overlayTitle.trim() : undefined,
      overlaySubtitle: triggerOverlay ? overlaySubtitle.trim() : undefined,
    };

    if (editingResp) {
      onUpdateResponse(responseData);
    } else {
      onAddResponse(responseData);
    }

    setShowModal(false);
  };

  const runLiveTest = () => {
    if (!testInput.trim()) return;

    const query = testInput.trim();
    for (const rule of responses) {
      if (!rule.enabled) continue;

      let matched = false;
      for (const pattern of rule.patterns) {
        if (rule.triggerType === 'exact') {
          matched = rule.caseSensitive
            ? query === pattern
            : query.toLowerCase() === pattern.toLowerCase();
        } else if (rule.triggerType === 'starts_with') {
          matched = rule.caseSensitive
            ? query.startsWith(pattern)
            : query.toLowerCase().startsWith(pattern.toLowerCase());
        } else if (rule.triggerType === 'regex') {
          try {
            const regex = new RegExp(pattern, rule.caseSensitive ? '' : 'i');
            matched = regex.test(query);
          } catch (_) {}
        } else {
          // 'contains'
          matched = rule.caseSensitive
            ? query.includes(pattern)
            : query.toLowerCase().includes(pattern.toLowerCase());
        }
        if (matched) break;
      }

      if (matched) {
        let chosen = rule.response;
        if (rule.responseMode === 'random_pool' && rule.responsePool?.length > 0) {
          chosen = rule.responsePool[Math.floor(Math.random() * rule.responsePool.length)];
        } else if (rule.responseMode === 'personality_pool' && personalities?.length > 0) {
          const targetPers = personalities.find((p) => p.id === rule.personalityId) || personalities[0];
          if (targetPers?.catchphrases?.length > 0) {
            chosen = `${targetPers.catchphrases[Math.floor(Math.random() * targetPers.catchphrases.length)]} ${rule.response}`;
          }
        }

        const formatted = chosen
          .replace(/{user}/g, 'Tester')
          .replace(/{game_name}/g, gameCategory || 'Apex Legends')
          .replace(/{streamer_name}/g, streamerName || 'MRADDICTIVE');

        setTestResult({
          matched: true,
          ruleName: rule.name,
          output: formatted,
          mode: rule.responseMode || 'single'
        });
        return;
      }
    }

    setTestResult({ matched: false });
  };

  const filteredResponses = responses.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.response.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patterns.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/20 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Auto-Responses & Smart Triggers</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {responses.length} Rules
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reply with custom answers, randomized variation pools, or pre-existing bot personality profiles
              </p>
            </div>
          </div>

          <button
            onClick={openNewModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 border border-white/20 transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Auto-Response</span>
          </button>
        </div>
      </div>

      {/* Quick Pre-existing Response Profiles Carousel */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BookmarkCheck className="w-4 h-4 text-cyan-400" />
            Quick-Add From Pre-Existing Response Profiles:
          </span>
          <span className="text-[11px] text-slate-500">Click a template to pre-fill</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_PROFILES.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => {
                handleApplyPresetProfile(prof);
                setShowModal(true);
              }}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                {prof.name}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                {prof.mode === 'random_pool' ? (
                  <span className="text-pink-300 font-mono">🎲 Random</span>
                ) : prof.mode === 'personality_pool' ? (
                  <span className="text-purple-300 font-mono">🎭 Persona</span>
                ) : (
                  <span className="text-cyan-300 font-mono">⚡ Fixed</span>
                )}
                <span>• {prof.patterns.length} triggers</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Trigger Sandbox Tester */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Interactive Pattern Sandbox (Test how DroidBot responds to chat)</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runLiveTest()}
            placeholder="Type a test chat message (e.g. 'what game is this?', 'discord', 'rules', 'hype')..."
            className="flex-1 px-3.5 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={runLiveTest}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Trigger</span>
          </button>
        </div>

        {testResult && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-white/10 text-xs">
            {testResult.matched ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Matched Rule: &quot;{testResult.ruleName}&quot;</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {testResult.mode}
                  </span>
                </div>
                <div className="text-slate-200 bg-white/[0.03] p-2 rounded-lg font-mono text-[11px]">
                  🤖 DroidBot: {testResult.output}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span>No active auto-response triggered for this message.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search response names, keywords, or reply messages..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Auto-Responses Cards List */}
      <div className="space-y-3.5">
        {filteredResponses.map((resp) => {
          const mode = resp.responseMode || (resp.responsePool && resp.responsePool.length > 1 ? 'random_pool' : 'single');
          return (
            <div
              key={resp.id}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                resp.enabled
                  ? 'bg-white/[0.03] border-white/10 hover:border-cyan-500/40'
                  : 'bg-slate-950/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-bold text-white">{resp.name}</span>
                  
                  {/* Mode Badge */}
                  {mode === 'random_pool' ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      <span>Random ({resp.responsePool?.length || 1} Variations)</span>
                    </span>
                  ) : mode === 'personality_pool' ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>Personality Profile</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Single Response
                    </span>
                  )}

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/10">
                    {resp.triggerType}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cooldown: <strong className="text-slate-200">{resp.cooldownSeconds}s</strong>
                  </span>
                  <span className="text-[11px] text-purple-300">
                    Triggered: <strong>{resp.matchCount} times</strong>
                  </span>
                </div>

                {/* Keywords / Patterns tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">Triggers:</span>
                  {resp.patterns.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.05] text-slate-300 border border-white/10"
                    >
                      &quot;{p}&quot;
                    </span>
                  ))}
                </div>

                {/* Response output message / Pool Preview */}
                <div className="text-xs text-cyan-200/90 bg-slate-950/70 p-2.5 rounded-xl border border-white/5 font-sans leading-relaxed">
                  {mode === 'random_pool' && resp.responsePool && resp.responsePool.length > 1 ? (
                    <div className="space-y-1">
                      <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Shuffle className="w-3 h-3" />
                        <span>Random Response Pool ({resp.responsePool.length} Variations):</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {resp.responsePool.slice(0, 3).map((r, i) => (
                          <li key={i} className="truncate">{r}</li>
                        ))}
                        {resp.responsePool.length > 3 && (
                          <li className="text-[10px] text-slate-500 italic">+ {resp.responsePool.length - 3} more variations</li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div>🤖 {resp.response}</div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onToggleResponse(resp.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    resp.enabled ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                  title={resp.enabled ? 'Disable Auto-Response' : 'Enable Auto-Response'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      resp.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button
                  onClick={() => openEditModal(resp)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit Auto-Response"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteResponse(resp.id)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Auto-Response"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <MessageSquareCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingResp ? 'Edit Auto-Response' : 'Create Auto-Response'}
                  </h3>
                  <p className="text-xs text-slate-400">Match incoming messages to instant answers or random pools</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Template Picker */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-load from Pre-existing Profile Template:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_PROFILES.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleApplyPresetProfile(prof)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[11px] font-bold text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    {prof.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Song Requests or Game Inquiries"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trigger Match Type</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="contains">Message Contains Keywords (Recommended)</option>
                    <option value="exact">Exact Sentence Match</option>
                    <option value="starts_with">Starts With Phrase</option>
                    <option value="regex">Regular Expression (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cooldown (Seconds)</label>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={cooldown}
                    onChange={(e) => setCooldown(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Trigger Keywords / Phrases (1 per line) *
                </label>
                <textarea
                  value={patternsInput}
                  onChange={(e) => setPatternsInput(e.target.value)}
                  placeholder="what game is this&#10;what game&#10;what are you playing"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* OBS Overlay Banner Trigger */}
              <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Trigger OBS Overlay Banner
                    </div>
                    <div className="text-[10px] text-slate-400">Show a pop-up banner on stream when this response triggers</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTriggerOverlay(!triggerOverlay)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      triggerOverlay ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      triggerOverlay ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {triggerOverlay && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Banner Style</label>
                      <select
                        value={overlayBannerPreset}
                        onChange={(e) => setOverlayBannerPreset(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="xbox">Xbox 360 Pop</option>
                        <option value="playstation">PlayStation Trophy</option>
                        <option value="steam">Steam Notification</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Title (Optional)</label>
                      <input
                        type="text"
                        value={overlayTitle}
                        onChange={(e) => setOverlayTitle(e.target.value)}
                        placeholder="e.g. NEW SUBSCRIBER!"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Subtitle (Variables supported)</label>
                      <input
                        type="text"
                        value={overlaySubtitle}
                        onChange={(e) => setOverlaySubtitle(e.target.value)}
                        placeholder="e.g. Welcome {username}!"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Response Mode Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">Response Delivery Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResponseMode('single')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      responseMode === 'single'
                        ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <MessageSquareCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Single Response</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">One fixed custom message</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseMode('random_pool')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      responseMode === 'random_pool'
                        ? 'bg-pink-600/30 border-pink-400 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Shuffle className="w-3.5 h-3.5 text-pink-400" />
                      <span>Random Response</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Picks randomly from list</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseMode('personality_pool')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      responseMode === 'personality_pool'
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Personality Profile</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Infuse with bot persona</div>
                  </button>
                </div>
              </div>

              {/* Single Message Input */}
              {responseMode === 'single' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bot Custom Response *</label>
                  <textarea
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    placeholder="🎮 Currently playing {game_name}! Drop a like and subscribe!"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Random Pool Multiple Variations Input */}
              {responseMode === 'random_pool' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Random Response Pool (1 variation per line) *
                  </label>
                  <textarea
                    value={poolInput}
                    onChange={(e) => setPoolInput(e.target.value)}
                    placeholder="Variation 1: 🎮 We are playing {game_name} right now!&#10;Variation 2: 🕹️ Live on {game_name}! Welcome to the stream, {user}!&#10;Variation 3: 🔥 It's {game_name} time! Drop your loadout tips!"
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-900 border border-pink-500/30 rounded-xl text-white font-mono focus:border-pink-400 focus:outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The bot will randomly choose one line each time the trigger matches.
                  </p>
                </div>
              )}

              {/* Personality Profile Selector */}
              {responseMode === 'personality_pool' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Select Bot Personality</label>
                    <select
                      value={selectedPersonalityId}
                      onChange={(e) => setSelectedPersonalityId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/40 rounded-xl text-white focus:border-purple-400 focus:outline-none"
                    >
                      {personalities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.vibe})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Personality Response Pool / Answers (1 per line)
                    </label>
                    <textarea
                      value={poolInput}
                      onChange={(e) => setPoolInput(e.target.value)}
                      placeholder="🤖 Error 404: Chill vibes only in this stream!&#10;🤖 My algorithms confirm: W streamer and W chat!"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-xl text-white font-mono focus:border-purple-400 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}
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
                disabled={!name.trim() || !patternsInput.trim() || (responseMode === 'single' ? !responseMsg.trim() : !poolInput.trim())}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                {editingResp ? 'Save Changes' : 'Create Auto-Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
