import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Check,
  Shield,
  Coins,
  Trophy,
  Package,
  Sparkles,
  Clock,
  MessageSquare,
  Flame,
  Award,
  Gift,
  X,
  Volume2,
  Star,
  Zap,
  Bot,
  RefreshCw,
  Sliders,
  Video,
  Megaphone
} from 'lucide-react';
import {
  ViewerProfile,
  CustomRole,
  ModerationLevel,
  InventoryItem,
  PersonalityResponseType,
  ResponseStyleDefinition
} from '../types';
import { INITIAL_RESPONSE_STYLES } from '../data/initialData';
import { substituteTokens } from '../services/botEngine';

interface ProfilesTabProps {
  profiles: ViewerProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<ViewerProfile[]>>;
  roles: CustomRole[];
  responseStyles?: Record<PersonalityResponseType, ResponseStyleDefinition>;
  onSaveNotice: () => void;
}

const PERSONALITY_OPTIONS: {
  id: PersonalityResponseType;
  label: string;
  icon: string;
  badgeClass: string;
  summary: string;
}[] = [
  {
    id: 'roast',
    label: 'Roast & Savage Banter',
    icon: '🔥',
    badgeClass: 'bg-red-950/80 text-red-300 border-red-800/50',
    summary: 'Brutal comebacks & teasing weaponizing their memory'
  },
  {
    id: 'friendly',
    label: 'Friendly & Welcoming',
    icon: '😊',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
    summary: 'Warm, positive, enthusiastic community love'
  },
  {
    id: 'calm',
    label: 'Calm & Zen',
    icon: '🍃',
    badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-800/50',
    summary: 'Mindful, peaceful, grounding vibes'
  },
  {
    id: 'sarcastic',
    label: 'Sarcastic & Dry',
    icon: '🙄',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800/50',
    summary: 'Ironic remarks, dry wit & dramatic eye-rolls'
  },
  {
    id: 'stubborn',
    label: 'Stubborn & Obstinate',
    icon: '😤',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
    summary: 'Argumentative, refuses to yield & stands on robot pride'
  },
  {
    id: 'hopeful',
    label: 'Hopeful & Inspiring',
    icon: '✨',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50',
    summary: 'Inspiring optimism, encouragement & cheering'
  },
  {
    id: 'annoyed',
    label: 'Annoyed & Grumpy',
    icon: '😒',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-800/50',
    summary: 'Comically impatient, dramatic sighs & tired of questions'
  },
  {
    id: 'default',
    label: 'Default Adaptive',
    icon: '🤖',
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-700',
    summary: 'Standard role-based responses'
  }
];

export const ProfilesTab: React.FC<ProfilesTabProps> = ({
  profiles,
  setProfiles,
  roles,
  responseStyles = INITIAL_RESPONSE_STYLES,
  onSaveNotice
}) => {
  const [selectedId, setSelectedId] = useState<string>(profiles[0]?.id || '');
  const [search, setSearch] = useState<string>('');
  const [newFactInput, setNewFactInput] = useState<string>('');

  // Simulation preview state
  const [testResponseOutput, setTestResponseOutput] = useState<string | null>(null);

  // Item Addition Modal/Form State
  const [showAddItem, setShowAddItem] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [itemType, setItemType] = useState<InventoryItem['type']>('badge');
  const [itemIcon, setItemIcon] = useState<string>('⭐');
  const [itemDescription, setItemDescription] = useState<string>('');

  const activeProfile = profiles.find((p) => p.id === selectedId) || profiles[0];

  const handleUpdateProfile = (field: keyof ViewerProfile, value: any) => {
    if (!activeProfile) return;
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfile.id ? { ...p, [field]: value } : p))
    );
  };

  const handleModerationChange = (level: ModerationLevel) => {
    handleUpdateProfile('moderationLevel', level);
    onSaveNotice();
  };

  const handleResponseTypeChange = (type: PersonalityResponseType) => {
    handleUpdateProfile('responseType', type);
    setTestResponseOutput(null);
    onSaveNotice();
  };

  const handleRoleChange = (newRole: string) => {
    handleUpdateProfile('role', newRole);
    onSaveNotice();
  };

  const handleAddPoints = (amount: number) => {
    if (!activeProfile) return;
    const newPoints = Math.max(0, activeProfile.points + amount);
    const newTotal =
      amount > 0 ? activeProfile.totalPointsEarned + amount : activeProfile.totalPointsEarned;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfile.id
          ? { ...p, points: newPoints, totalPointsEarned: newTotal }
          : p
      )
    );
    onSaveNotice();
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactInput.trim() || !activeProfile) return;

    const updatedFacts = [...(activeProfile.customFacts || []), newFactInput.trim()];
    handleUpdateProfile('customFacts', updatedFacts);
    setNewFactInput('');
    onSaveNotice();
  };

  const handleDeleteFact = (index: number) => {
    if (!activeProfile) return;
    const updatedFacts = activeProfile.customFacts.filter((_, i) => i !== index);
    handleUpdateProfile('customFacts', updatedFacts);
    onSaveNotice();
  };

  const handleAddItemToInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !activeProfile) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: itemName.trim(),
      type: itemType,
      icon: itemIcon.trim() || '🎒',
      description: itemDescription.trim() || 'Awarded by stream broadcaster',
      acquiredAt: new Date().toISOString().split('T')[0]
    };

    const updatedInventory = [...(activeProfile.inventory || []), newItem];
    handleUpdateProfile('inventory', updatedInventory);
    setItemName('');
    setItemDescription('');
    setShowAddItem(false);
    onSaveNotice();
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    if (!activeProfile) return;
    const updatedInventory = activeProfile.inventory.filter((item) => item.id !== itemId);
    handleUpdateProfile('inventory', updatedInventory);
    onSaveNotice();
  };

  const handleQuickAwardBadge = (badgeName: string, icon: string, desc: string) => {
    if (!activeProfile) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: badgeName,
      type: 'badge',
      icon,
      description: desc,
      acquiredAt: new Date().toISOString().split('T')[0]
    };
    const updatedInventory = [...(activeProfile.inventory || []), newItem];
    handleUpdateProfile('inventory', updatedInventory);
    onSaveNotice();
  };

  const handleSimulateResponse = () => {
    if (!activeProfile) return;
    const styleKey = activeProfile.responseType || 'default';
    const styleDef = responseStyles[styleKey] || responseStyles.default;
    const allMemories = [
      ...(activeProfile.customFacts || []),
      ...(activeProfile.memoryItems?.map((m) => m.fact) || [])
    ];

    const pool =
      allMemories.length > 0 && styleDef.memoryInfusedResponses?.length > 0
        ? [...styleDef.memoryInfusedResponses, ...styleDef.chatResponses]
        : styleDef.chatResponses || styleDef.greetingResponses;

    const chosenTemplate = pool[Math.floor(Math.random() * pool.length)] || 'Hello @{username}!';

    const rendered = substituteTokens(chosenTemplate, {
      username: activeProfile.username,
      botName: 'DroidBot',
      streamerName: 'Streamer',
      channelName: 'LiveChannel',
      userPoints: activeProfile.points,
      currencyName: 'DroidCoins',
      userRole: activeProfile.role,
      responseType: styleKey,
      memoryFacts: allMemories
    });

    setTestResponseOutput(rendered);
  };

  const handleDeleteProfile = () => {
    if (!activeProfile || !window.confirm(`Are you sure you want to delete the profile for @${activeProfile.username}?`)) return;
    
    setProfiles((prev) => prev.filter((p) => p.id !== activeProfile.id));
    setSelectedId('');
    onSaveNotice();
  };

  const handleCreateNewViewer = () => {
    const newUsername = `Viewer_${Math.floor(100 + Math.random() * 900)}`;
    const newP: ViewerProfile = {
      id: `prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: newUsername,
      displayName: newUsername,
      role: 'viewer',
      moderationLevel: 0,
      responseType: 'friendly',
      points: 100,
      totalPointsEarned: 100,
      watchTimeMinutes: 10,
      customFacts: ['New community member'],
      notes: 'Manually created profile with active inventory.',
      firstSeen: new Date().toISOString().split('T')[0],
      lastSeen: 'Just now',
      messageCount: 1,
      visitStreak: 1,
      memoryItems: [
        {
          id: `mem-${Date.now()}`,
          timestamp: new Date().toISOString().split('T')[0],
          fact: 'Initialized personal inventory profile.',
          addedBy: 'auto'
        }
      ],
      inventory: [
        {
          id: `inv-${Date.now()}-starter`,
          name: '🌱 Welcome Explorer Badge',
          type: 'badge',
          icon: '🌱',
          description: 'Awarded automatically upon entering chat for the first time',
          acquiredAt: new Date().toISOString().split('T')[0]
        }
      ],
      achievements: [
        {
          achievementId: 'ach-first-chat',
          unlockedAt: new Date().toISOString().split('T')[0],
          progress: 1
        }
      ],
      avatarColor: 'from-blue-600 to-indigo-600'
    };

    setProfiles((prev) => [newP, ...prev]);
    setSelectedId(newP.id);
    onSaveNotice();
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      (p.responseType && p.responseType.toLowerCase().includes(search.toLowerCase()))
  );

  const activePersona =
    PERSONALITY_OPTIONS.find((opt) => opt.id === (activeProfile?.responseType || 'default')) ||
    PERSONALITY_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Viewer Intelligence, Persona & Inventory</h2>
            <p className="text-xs text-slate-400">
              Configure targeted bot response types (Roast, Calm, Sarcastic, Friendly, Stubborn, Hopeful, Annoyed) and memory facts per viewer
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewViewer}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Viewer Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Viewer Profiles List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search username, role or persona..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[580px] scrollbar-thin flex-1">
            {filteredProfiles.map((p) => {
              const pOpt = PERSONALITY_OPTIONS.find((opt) => opt.id === (p.responseType || 'default'));
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setTestResponseOutput(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    activeProfile?.id === p.id
                      ? 'bg-blue-950/40 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${
                        p.avatarColor || 'from-blue-600 to-indigo-600'
                      } flex items-center justify-center font-bold text-xs text-white shadow-sm`}
                    >
                      {p.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{p.username}</span>
                        {p.moderationLevel > 0 && (
                          <span className="text-[9px] px-1 rounded bg-purple-900 text-purple-200">
                            Lvl {p.moderationLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        {p.points.toLocaleString()} pts • {p.inventory?.length || 0} items
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                        pOpt?.badgeClass || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {pOpt?.icon} {p.responseType || 'default'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{p.role}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Profile Detailed Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col text-xs">
          {activeProfile ? (
            <>
              {/* Profile Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                      activeProfile.avatarColor || 'from-blue-600 to-indigo-600'
                    } flex items-center justify-center font-black text-white text-lg shadow-md`}
                  >
                    {activeProfile.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{activeProfile.username}</span>
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      First Seen: {activeProfile.firstSeen} • Last Seen: {activeProfile.lastSeen}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteProfile}
                    className="px-3 py-2 rounded-xl bg-rose-950/20 text-rose-400 border border-rose-900/50 hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  
                  {/* Moderation Level Selector (In-App Only) */}
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 font-semibold">Moderation Level:</span>
                    <select
                      value={activeProfile.moderationLevel}
                      onChange={(e) =>
                        handleModerationChange(Number(e.target.value) as ModerationLevel)
                      }
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-purple-500"
                    >
                      <option value={0}>Level 0 - Regular Viewer</option>
                      <option value={1}>Level 1 - Trusted Regular</option>
                      <option value={2}>Level 2 - VIP Access</option>
                      <option value={3}>Level 3 - Moderator</option>
                      <option value={4}>Level 4 - Broadcaster Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TARGETED BOT RESPONSE TYPE SELECTOR (THE CORE USER REQUIREMENT) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Targeted Bot Response Persona & Style
                    </span>
                  </div>

                  <button
                    onClick={handleSimulateResponse}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Bot Response</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When <strong>@{activeProfile.username}</strong> chats or asks questions, DroidOS will strictly pull responses from the selected persona section and dynamically weave in their stored memory facts!
                </p>

                {/* Personality Badges / Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PERSONALITY_OPTIONS.map((opt) => {
                    const isSelected = (activeProfile.responseType || 'default') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleResponseTypeChange(opt.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500'
                            : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <span className="text-base">{opt.icon}</span>
                          <span>{opt.label.split(' ')[0]}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {opt.summary}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Persona Banner & Test Output */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                  <div className="text-2xl mt-0.5">{activePersona.icon}</div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <span>Active Persona: {activePersona.label}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Memory Facts Linked: {activeProfile.customFacts?.length || 0}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{activePersona.summary}</p>

                    {testResponseOutput && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-blue-500/40 text-blue-200 font-mono text-[11px] leading-relaxed animate-fadeIn">
                        <span className="font-bold text-blue-400 block mb-0.5">🤖 Simulated Bot Output:</span>
                        {testResponseOutput}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Memory Facts & Stream History Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>
                      Viewer Memory Bank ({activeProfile.customFacts?.length || 0} facts active for persona integration)
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  These memory facts are dynamically injected into <strong>{activePersona.label}</strong> comebacks, greetings, and AI answers.
                </p>

                <form onSubmit={handleAddFact} className="flex gap-2">
                  <input
                    type="text"
                    value={newFactInput}
                    onChange={(e) => setNewFactInput(e.target.value)}
                    placeholder="Add memory fact (e.g. missed 12 sniper shots, loves retro gaming, stream VIP since Jan)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Memory</span>
                  </button>
                </form>

                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {activeProfile.customFacts && activeProfile.customFacts.length > 0 ? (
                    activeProfile.customFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{fact}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteFact(idx)}
                          className="p-1 rounded bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-xs">
                      No memory facts saved yet. Add facts above to feed into the {activePersona.label} responses!
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Points Balance</span>
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-black text-amber-300 font-mono">
                    {activeProfile.points.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => handleAddPoints(100)}
                      className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 text-[9px] hover:bg-amber-900 cursor-pointer"
                    >
                      +100
                    </button>
                    <button
                      onClick={() => handleAddPoints(500)}
                      className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 text-[9px] hover:bg-amber-900 cursor-pointer"
                    >
                      +500
                    </button>
                    <button
                      onClick={() => handleAddPoints(-100)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] hover:bg-slate-700 cursor-pointer"
                    >
                      -100
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Watch Time</span>
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {Math.round(activeProfile.watchTimeMinutes / 60)} hrs ({activeProfile.watchTimeMinutes}m)
                  </div>
                  <div className="text-[10px] text-slate-500">Auto-tracked</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Messages</span>
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {activeProfile.messageCount}
                  </div>
                  <div className="text-[10px] text-slate-500">Chat messages</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Visit Streak</span>
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-base font-bold text-rose-300 font-mono">
                    {activeProfile.visitStreak} streams
                  </div>
                  <div className="text-[10px] text-slate-500">Stream loyalty</div>
                </div>
              </div>

              {/* Personal Inventory System */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Viewer Personal Inventory ({activeProfile.inventory?.length || 0} items)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuickAwardBadge(
                          '⭐ VIP Gold Badge',
                          '⭐',
                          'Awarded for extraordinary stream support'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-bold hover:bg-amber-900/60 cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>+ VIP Badge</span>
                    </button>
                    <button
                      onClick={() => setShowAddItem(!showAddItem)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Custom Item</span>
                    </button>
                  </div>
                </div>

                {/* Add Item Form */}
                {showAddItem && (
                  <form
                    onSubmit={handleAddItemToInventory}
                    className="p-3.5 rounded-xl bg-slate-900 border border-blue-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-blue-400" />
                        <span>Grant Item to @{activeProfile.username}'s Inventory</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddItem(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Item Name</label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g. 🎺 Victory Horn Token"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Item Type</label>
                        <select
                          value={itemType}
                          onChange={(e: any) => setItemType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="badge">Badge</option>
                          <option value="sound">Sound Token</option>
                          <option value="gif">GIF / Emote</option>
                          <option value="perk">Stream Perk</option>
                          <option value="custom">Custom Item</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Icon / Emoji</label>
                        <input
                          type="text"
                          value={itemIcon}
                          onChange={(e) => setItemIcon(e.target.value)}
                          placeholder="e.g. ⭐, 🎺, 🛡️, 💎"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Description</label>
                      <input
                        type="text"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="e.g. Gives viewer access to custom chat triggers and sound effects"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddItem(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                      >
                        Grant to Inventory
                      </button>
                    </div>
                  </form>
                )}

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProfile.inventory && activeProfile.inventory.length > 0 ? (
                    activeProfile.inventory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-sm">{item.icon || '🎁'}</span>
                            <span>{item.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                          <div className="text-[9px] text-slate-500">Acquired: {item.acquiredAt}</div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.type}
                          </span>
                          <button
                            onClick={() => handleDeleteInventoryItem(item.id)}
                            title="Remove from inventory"
                            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-slate-500 text-xs bg-slate-900/60 rounded-xl border border-slate-800">
                      Inventory currently empty.
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube Profile Picture & OBS Shoutout Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      YouTube Avatar & OBS Shoutout Configuration
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Auto-Pops up in OBS on 1st Chat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400">
                      YouTube Profile Picture / Avatar URL
                    </label>
                    <input
                      type="url"
                      value={activeProfile.avatarUrl || ''}
                      onChange={(e) => handleUpdateProfile('avatarUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/... or youtube avatar url"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400">
                      YouTube Channel Link
                    </label>
                    <input
                      type="url"
                      value={activeProfile.channelUrl || ''}
                      onChange={(e) => handleUpdateProfile('channelUrl', e.target.value)}
                      placeholder={`https://youtube.com/@${activeProfile.username}`}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[10px] text-slate-400">
                      Custom Shoutout Message (Overrides default template)
                    </label>
                    <input
                      type="text"
                      value={activeProfile.customShoutoutMessage || ''}
                      onChange={(e) =>
                        handleUpdateProfile('customShoutoutMessage', e.target.value)
                      }
                      placeholder="e.g. Welcome our legendary raid leader @{username}! Check out their channel: {channel_url}"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer w-full hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={activeProfile.autoShoutout !== false}
                        onChange={(e) =>
                          handleUpdateProfile('autoShoutout', e.target.checked)
                        }
                        className="w-4 h-4 text-cyan-500 rounded bg-slate-950 border-slate-700"
                      />
                      <span className="text-[11px] text-slate-200 font-medium leading-tight">
                        Enable Auto-Shoutout on 1st Chat
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Role Switcher & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-semibold">Assigned Chat Role</label>
                  <select
                    value={activeProfile.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} Tier
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-semibold">Streamer Internal Notes</label>
                  <input
                    type="text"
                    value={activeProfile.notes}
                    onChange={(e) => handleUpdateProfile('notes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Private streamer notes..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select or create a viewer profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
