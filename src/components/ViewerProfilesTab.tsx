import React, { useState } from 'react';
import {
  Users,
  Search,
  Sparkles,
  Plus,
  Trash2,
  Award,
  Coins,
  Shield,
  Clock,
  MessageSquare,
  Flame,
  Check,
  Edit2,
  Bot,
  UserCheck,
  AlertTriangle,
  Heart,
  Smile,
  Zap,
  VolumeX,
  Star,
  Link,
  ChevronDown,
  Layers
} from 'lucide-react';
import {
  ViewerProfile,
  UserRole,
  EconomySettings,
  BotPersonality,
  AutoResponse,
  AppSettings
} from '../types';
import { soundSynth } from '../services/soundSynthesizer';

interface ViewerProfilesTabProps {
  viewers: ViewerProfile[];
  onUpdateViewer: (viewer: ViewerProfile) => void;
  onDeleteViewer?: (viewerId: string) => void;
  onAddViewer?: (viewer: ViewerProfile) => void;
  economy: EconomySettings;
  personalities: BotPersonality[];
  autoResponses: AutoResponse[];
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
}

export const ViewerProfilesTab: React.FC<ViewerProfilesTabProps> = ({
  viewers,
  onUpdateViewer,
  onDeleteViewer,
  onAddViewer,
  economy,
  personalities = [],
  autoResponses = [],
  settings,
  onUpdateSettings
}) => {
  const [selectedViewerId, setSelectedViewerId] = useState<string>(viewers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeIcon, setNewBadgeIcon] = useState('⭐');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'bot_response' | 'memory' | 'badges'>('bot_response');

  const autoWelcomeActive = settings?.autoWelcomeViewers ?? true;
  const autoWelcomeMode = settings?.autoWelcomeMode || 'all';

  const handleToggleAutoWelcome = () => {
    if (settings && onUpdateSettings) {
      soundSynth.play('coin');
      onUpdateSettings({
        ...settings,
        autoWelcomeViewers: !autoWelcomeActive
      });
    }
  };

  const handleSetWelcomeMode = (mode: 'all' | 'new_only' | 'returning_memory') => {
    if (settings && onUpdateSettings) {
      soundSynth.play('coin');
      onUpdateSettings({
        ...settings,
        autoWelcomeMode: mode
      });
    }
  };

  // New viewer modal form state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [newPoints, setNewPoints] = useState('500');

  const selectedViewer = viewers.find((v) => v.id === selectedViewerId) || viewers[0];

  const handleAddFact = () => {
    if (!newFact.trim() || !selectedViewer) return;
    const updated: ViewerProfile = {
      ...selectedViewer,
      customFacts: [...(selectedViewer.customFacts || []), newFact.trim()]
    };
    onUpdateViewer(updated);
    setNewFact('');
  };

  const handleDeleteFact = (index: number) => {
    if (!selectedViewer) return;
    const updated: ViewerProfile = {
      ...selectedViewer,
      customFacts: selectedViewer.customFacts.filter((_, i) => i !== index)
    };
    onUpdateViewer(updated);
  };

  const handleAddBadge = () => {
    if (!newBadgeName.trim() || !selectedViewer) return;
    const updated: ViewerProfile = {
      ...selectedViewer,
      inventory: [
        ...(selectedViewer.inventory || []),
        {
          id: `badge-${Date.now()}`,
          name: newBadgeName.trim(),
          type: 'badge' as const,
          icon: newBadgeIcon || '⭐',
          description: 'Special community achievement',
          acquiredAt: new Date().toISOString().split('T')[0]
        }
      ]
    };
    onUpdateViewer(updated);
    setNewBadgeName('');
  };

  const handleDeleteViewer = () => {
    if (!selectedViewer || !onDeleteViewer) return;
    const currentId = selectedViewer.id;
    onDeleteViewer(currentId);
    setShowDeleteConfirm(false);
    const remaining = viewers.filter((v) => v.id !== currentId);
    if (remaining.length > 0) {
      setSelectedViewerId(remaining[0].id);
    }
  };

  const handleCreateNewViewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !onAddViewer) return;

    const colors = [
      'from-purple-500 to-indigo-600',
      'from-emerald-400 to-teal-600',
      'from-blue-500 to-cyan-400',
      'from-amber-500 to-rose-600',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-600'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: ViewerProfile = {
      id: `prof-${Date.now()}`,
      username: newUsername.trim().replace('@', ''),
      displayName: newDisplayName.trim() || newUsername.trim().replace('@', ''),
      role: newRole,
      moderationLevel: newRole === 'moderator' ? 3 : newRole === 'vip' ? 2 : 1,
      points: parseInt(newPoints, 10) || 500,
      totalPointsEarned: parseInt(newPoints, 10) || 500,
      watchTimeMinutes: 30,
      customFacts: [],
      notes: 'New chatter profile.',
      firstSeen: new Date().toISOString().split('T')[0],
      lastSeen: 'Just added',
      messageCount: 1,
      visitStreak: 1,
      memoryItems: [],
      inventory: [],
      achievements: [],
      avatarColor: randomColor,
      channelUrl: `https://youtube.com/@${newUsername.trim().replace('@', '')}`,
      personalityOverrideId: 'default',
      responseBehavior: 'personality_default',
      linkedAutoResponseIds: []
    };

    onAddViewer(created);
    setSelectedViewerId(created.id);
    setShowAddModal(false);
    setNewUsername('');
    setNewDisplayName('');
    setNewPoints('500');
  };

  const handleToggleLinkedResponse = (respId: string) => {
    if (!selectedViewer) return;
    const current = selectedViewer.linkedAutoResponseIds || [];
    const updatedList = current.includes(respId)
      ? current.filter((id) => id !== respId)
      : [...current, respId];

    const updated = {
      ...selectedViewer,
      linkedAutoResponseIds: updatedList
    };
    onUpdateViewer(updated);
  };

  const filtered = viewers.filter(
    (v) =>
      v.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* AUTO-WELCOME & MEMORY RESPONSES CONTROL PANEL */}
      <div className="p-5 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">Stream Auto-Welcome & Memory Greeting System</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  autoWelcomeActive ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {autoWelcomeActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                New viewers receive first-contact personality greetings. Returning viewers receive memory responses referencing their past stream memories!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAutoWelcome}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              autoWelcomeActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 hover:bg-purple-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Welcome: {autoWelcomeActive ? 'Enabled (ON)' : 'Disabled (OFF)'}</span>
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold text-[11px] pr-2">Strategy Mode:</span>
          <button
            type="button"
            onClick={() => handleSetWelcomeMode('all')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              autoWelcomeMode === 'all'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            🌟 All Chatters (New: Greetings • Returning: Memories)
          </button>
          <button
            type="button"
            onClick={() => handleSetWelcomeMode('new_only')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              autoWelcomeMode === 'new_only'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            👋 New Chatters Only
          </button>
          <button
            type="button"
            onClick={() => handleSetWelcomeMode('returning_memory')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              autoWelcomeMode === 'returning_memory'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            🧠 Returning Viewers with Memory Only
          </button>
        </div>
      </div>

      {/* SEARCH AND ADD CHATTER ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search chatters by username, nickname, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400/50"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Chatter Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Chatters List */}
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2.5 max-h-[680px] overflow-y-auto backdrop-blur-xl">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/[0.08]">
            <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              Chatter Registry ({filtered.length})
            </h2>
            <span className="text-[10px] text-slate-500">Select to configure</span>
          </div>

          {filtered.map((v) => {
            const isSelected = v.id === selectedViewer?.id;
            return (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedViewerId(v.id);
                  setShowDeleteConfirm(false);
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-400/50 shadow-md shadow-purple-950/40 text-white'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {v.profilePictureUrl ? (
                    <img src={v.profilePictureUrl} alt={v.displayName} className="w-9 h-9 rounded-xl shrink-0 object-cover shadow-sm" />
                  ) : (
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${v.avatarColor || 'from-purple-500 to-indigo-600'} flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-sm`}>
                      {v.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{v.displayName}</span>
                      {v.responseBehavior === 'always_roast' && (
                        <Flame className="w-3 h-3 text-red-400" title="Always Roast Active" />
                      )}
                      {v.responseBehavior === 'always_praise' && (
                        <Heart className="w-3 h-3 text-pink-400" title="Always Praise Active" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
                      <span>{v.role}</span>
                      {v.personalityOverrideId && v.personalityOverrideId !== 'default' && (
                        <span className="text-cyan-300 font-bold">• {v.personalityOverrideId}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-300 font-mono">
                    {v.points?.toLocaleString() || 0} {economy.currencySymbol}
                  </div>
                  <div className="text-[9px] text-slate-500">{v.customFacts?.length || 0} facts</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Chatter Inspector & Bot Response Config */}
        {selectedViewer ? (
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 backdrop-blur-xl shadow-xl">
            
            {/* Top Chatter Header with Delete Option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3.5">
                {selectedViewer.profilePictureUrl ? (
                  <img src={selectedViewer.profilePictureUrl} alt={selectedViewer.displayName} className="w-14 h-14 rounded-2xl shrink-0 object-cover shadow-lg" />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedViewer.avatarColor || 'from-purple-500 to-indigo-600'} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                    {selectedViewer.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>{selectedViewer.displayName}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal">(@{selectedViewer.username})</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={selectedViewer.role}
                      onChange={(e) => {
                        onUpdateViewer({ ...selectedViewer, role: e.target.value as UserRole });
                      }}
                      className="bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-purple-200 font-bold uppercase focus:outline-none"
                    >
                      <option value="owner">Host / Owner</option>
                      <option value="moderator">Moderator</option>
                      <option value="vip">VIP</option>
                      <option value="subscriber">Subscriber</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <span className="text-xs font-extrabold text-amber-300 font-mono">
                      {selectedViewer.points?.toLocaleString() || 0} {economy.currencySymbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Points & Delete Profile */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onUpdateViewer({ ...selectedViewer, points: (selectedViewer.points || 0) + 500 });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs cursor-pointer transition-colors"
                >
                  +500 {economy.currencySymbol}
                </button>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Delete Viewer Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 p-1 bg-red-950/80 border border-red-500/50 rounded-xl">
                    <button
                      onClick={handleDeleteViewer}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs">
              <button
                onClick={() => setActiveSubTab('bot_response')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeSubTab === 'bot_response'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                <span>Bot Response Behavior & Personality</span>
              </button>

              <button
                onClick={() => setActiveSubTab('memory')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeSubTab === 'memory'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Memory Facts ({selectedViewer.customFacts?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('badges')}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeSubTab === 'badges'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-300" />
                <span>Badges & Perks ({selectedViewer.inventory?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: Bot Response Logic Linked to Personalities & Responses Tab */}
            {activeSubTab === 'bot_response' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-400" />
                    Targeted Interaction Rule for @{selectedViewer.username}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Configure exactly how the bot should interact when this person chats, which personality persona to apply, custom greeting lines, or link specific auto-response triggers from your Responses tab.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Bot Personality Persona Override */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold">
                      Persona / Personality Override:
                    </label>
                    <select
                      value={selectedViewer.personalityOverrideId || 'default'}
                      onChange={(e) => {
                        onUpdateViewer({
                          ...selectedViewer,
                          personalityOverrideId: e.target.value
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="default">🌐 Follow Global Stream Personality</option>
                      {personalities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.label} - {p.description.slice(0, 35)}...
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 block">
                      Choose which persona answers this user in chat.
                    </span>
                  </div>

                  {/* Response Behavior Mode */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold">
                      Response Behavior Pattern:
                    </label>
                    <select
                      value={selectedViewer.responseBehavior || 'personality_default'}
                      onChange={(e) => {
                        onUpdateViewer({
                          ...selectedViewer,
                          responseBehavior: e.target.value as any
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="personality_default">💬 Standard (Follows Persona banter & questions)</option>
                      <option value="always_roast">🔥 Always Roast (Savagely banter with this chatter)</option>
                      <option value="always_praise">👑 Always Praise & Hype (VIP royal treatment)</option>
                      <option value="custom_reply_template">✨ Custom Reply Template (Specific format below)</option>
                      <option value="silent">🔇 Silent / No Auto Bot Replies (Ignore automated banter)</option>
                    </select>
                    <span className="text-[10px] text-slate-500 block">
                      Defines the priority attitude when replying to their messages.
                    </span>
                  </div>
                </div>

                {/* Custom Greeting Line */}
                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-300 font-bold">
                    Custom Arrival Greeting Line (When chatter first speaks):
                  </label>
                  <input
                    type="text"
                    value={selectedViewer.customGreeting || ''}
                    onChange={(e) => {
                      onUpdateViewer({ ...selectedViewer, customGreeting: e.target.value });
                    }}
                    placeholder="e.g. Welcome back my top moderator @{username}! Standing by for orders! 🫡"
                    className="w-full px-3.5 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-500">
                    Variables available: {'{username}'}, {'{streamer_name}'}, {'{user_points}'}
                  </span>
                </div>

                {/* Custom Template / Roast Prompt */}
                {selectedViewer.responseBehavior === 'custom_reply_template' && (
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-purple-300 font-bold">
                      Custom Bot Reply Template:
                    </label>
                    <input
                      type="text"
                      value={selectedViewer.customBotReplyTemplate || ''}
                      onChange={(e) => {
                        onUpdateViewer({ ...selectedViewer, customBotReplyTemplate: e.target.value });
                      }}
                      placeholder="e.g. Hey @{user}! You have {points} coins ready to duel or gamble! 🎰"
                      className="w-full px-3.5 py-2 bg-slate-900/90 border border-purple-500/40 rounded-xl text-white placeholder:text-slate-600 focus:border-purple-400 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                )}

                {selectedViewer.responseBehavior === 'always_roast' && (
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-red-300 font-bold">
                      Special Roast Angle / Fact to mention in banter:
                    </label>
                    <input
                      type="text"
                      value={selectedViewer.customRoastPrompt || ''}
                      onChange={(e) => {
                        onUpdateViewer({ ...selectedViewer, customRoastPrompt: e.target.value });
                      }}
                      placeholder="e.g. Always remind them about the 0-10 K/D match they had yesterday! 😂"
                      className="w-full px-3.5 py-2 bg-slate-900/90 border border-red-500/40 rounded-xl text-white placeholder:text-slate-600 focus:border-red-400 focus:outline-none text-[11px]"
                    />
                  </div>
                )}

                {/* Linked Auto-Responses from Responses Tab */}
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-cyan-400" />
                      Link Auto-Responses from Responses Tab:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {selectedViewer.linkedAutoResponseIds?.length || 0} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/60 rounded-2xl border border-white/5">
                    {autoResponses.map((resp) => {
                      const isLinked = selectedViewer.linkedAutoResponseIds?.includes(resp.id);
                      return (
                        <div
                          key={resp.id}
                          onClick={() => handleToggleLinkedResponse(resp.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                            isLinked
                              ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate text-[11px]">{resp.name}</div>
                            <div className="text-[9px] text-slate-500 truncate">
                              Patterns: {(resp.patterns || (resp as any).triggers || []).join(', ')}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(isLinked)}
                            onChange={() => {}}
                            className="rounded accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Stored Memory Facts */}
            {activeSubTab === 'memory' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Bot Memory Facts for Banter & Roasts
                  </h3>
                  <span className="text-[11px] text-slate-500">Auto-infused during live chat</span>
                </div>

                <div className="space-y-2">
                  {selectedViewer.customFacts?.map((fact, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200">
                      <span className="font-sans">"{fact}"</span>
                      <button
                        onClick={() => handleDeleteFact(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!selectedViewer.customFacts || selectedViewer.customFacts.length === 0) && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-500">
                      No custom memory facts recorded yet. Add one below!
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add new custom fact (e.g. Always bets all coins on red, Beat Dark Souls with guitar)..."
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400/50"
                  />
                  <button
                    onClick={handleAddFact}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Fact
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Badges & Inventory */}
            {activeSubTab === 'badges' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Awarded Badges & Perks ({selectedViewer.inventory?.length || 0})
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedViewer.inventory?.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-2 text-xs"
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <div>
                        <div className="font-bold text-white text-[11px]">{badge.name}</div>
                        <div className="text-[9px] text-slate-400">{badge.acquiredAt}</div>
                      </div>
                    </div>
                  ))}
                  {(!selectedViewer.inventory || selectedViewer.inventory.length === 0) && (
                    <div className="w-full p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-500">
                      No custom badges awarded yet.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Icon"
                    value={newBadgeIcon}
                    onChange={(e) => setNewBadgeIcon(e.target.value)}
                    className="w-16 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-amber-400/50"
                  />
                  <input
                    type="text"
                    placeholder="Badge Title (e.g. Boss Slayer, Night Owl, Top Donor)..."
                    value={newBadgeName}
                    onChange={(e) => setNewBadgeName(e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
                  />
                  <button
                    onClick={handleAddBadge}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Award
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Select or create a chatter profile to customize bot responses.</p>
          </div>
        )}
      </div>

      {/* Add New Chatter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">Create Chatter Profile</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewViewer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">YouTube Username / Handle *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CyberValkyrie"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber Valkyrie"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="subscriber">Subscriber</option>
                    <option value="vip">VIP</option>
                    <option value="moderator">Moderator</option>
                    <option value="owner">Host / Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starting {economy.currencyName}</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
