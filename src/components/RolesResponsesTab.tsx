import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Shield, Star, Crown, MessageSquare, HelpCircle, FileText, Check, Sparkles, BrainCircuit } from 'lucide-react';
import { CustomRole, BotIdentity } from '../types';

interface RolesResponsesTabProps {
  roles: CustomRole[];
  setRoles: React.Dispatch<React.SetStateAction<CustomRole[]>>;
  botIdentity: BotIdentity;
  setBotIdentity: React.Dispatch<React.SetStateAction<BotIdentity>>;
  onSaveNotice: () => void;
}

export const RolesResponsesTab: React.FC<RolesResponsesTabProps> = ({
  roles,
  setRoles,
  botIdentity,
  setBotIdentity,
  onSaveNotice
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'owner');
  const [activeSubTab, setActiveSubTab] = useState<'greetings' | 'questions'>('greetings');
  const [newResponseText, setNewResponseText] = useState<string>('');
  const [showNewRoleModal, setShowNewRoleModal] = useState<boolean>(false);

  // New role state
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleColor, setNewRoleColor] = useState<string>('#8b5cf6');
  const [newRoleBadge, setNewRoleBadge] = useState<string>('⭐ CUSTOM');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [newRolePriority, setNewRolePriority] = useState<number>(30);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleAddResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponseText.trim() || !selectedRole) return;

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        if (activeSubTab === 'greetings') {
          return { ...r, greetingResponses: [...r.greetingResponses, newResponseText.trim()] };
        } else {
          return { ...r, questionResponses: [...r.questionResponses, newResponseText.trim()] };
        }
      })
    );
    setNewResponseText('');
  };

  const handleDeleteResponse = (index: number) => {
    if (!selectedRole) return;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        if (activeSubTab === 'greetings') {
          return { ...r, greetingResponses: r.greetingResponses.filter((_, i) => i !== index) };
        } else {
          return { ...r, questionResponses: r.questionResponses.filter((_, i) => i !== index) };
        }
      })
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const id = newRoleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newRole: CustomRole = {
      id,
      name: newRoleName.trim(),
      color: newRoleColor,
      badgeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
      badgeText: newRoleBadge.trim() || `✨ ${newRoleName.toUpperCase()}`,
      description: newRoleDesc.trim() || 'Custom community tier role.',
      priority: newRolePriority,
      isBuiltIn: false,
      greetingResponses: [
        `Welcome ${newRoleName} {username}! Exclusive perks active.`,
        `High honor to have ${newRoleName} {username} in the live stream!`
      ],
      questionResponses: [
        `Special ${newRoleName} information available for {username}.`
      ]
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(id);
    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    onSaveNotice();
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm(`Are you sure you want to delete custom role "${roleId}"?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      if (selectedRoleId === roleId) {
        setSelectedRoleId('owner');
      }
    }
  };

  const insertToken = (token: string) => {
    setNewResponseText((prev) => prev + token);
  };

  const currentResponses =
    activeSubTab === 'greetings'
      ? selectedRole?.greetingResponses || []
      : selectedRole?.questionResponses || [];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Role-Based Response System & Custom Roles</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure responses stored in role files (<code className="text-blue-300 font-mono">responses/{selectedRole?.id}_greetings.txt</code>). High priority roles take precedence.
            </p>
          </div>

          <button
            id="create-custom-role-btn"
            onClick={() => setShowNewRoleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        {/* Gemini Toggle Card */}
        <div className={`p-5 rounded-xl border transition-all shadow-xl flex flex-col justify-between gap-3 min-w-[280px] ${
          botIdentity.geminiEnabled 
            ? 'bg-indigo-950/30 border-indigo-500/30' 
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                botIdentity.geminiEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gemini AI Intelligence</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {botIdentity.geminiEnabled ? 'Online & Active' : 'Offline / Manual Only'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setBotIdentity(prev => ({ ...prev, geminiEnabled: !prev.geminiEnabled }));
                onSaveNotice();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                botIdentity.geminiEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  botIdentity.geminiEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {botIdentity.geminiEnabled 
              ? "The bot will use Gemini to generate dynamic, intelligent responses for AI commands."
              : "Bot will only use manually configured role responses and triggers. AI commands will be ignored."}
          </p>
        </div>
      </div>

      {/* Main Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Role Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Configured Roles ({roles.length})
          </h3>
          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: role.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{role.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                          P:{role.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block line-clamp-1">
                        {role.greetingResponses.length} greetings, {role.questionResponses.length} answers
                      </span>
                    </div>
                  </div>

                  {!role.isBuiltIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Response Templates Editor */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
            {/* Header of selected role */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedRole?.color }}
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedRole?.name} Responses
                    {selectedRole?.isBuiltIn ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        Built-in Role
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        Custom Role
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedRole?.description}</p>
                </div>
              </div>

              {/* Sub-tabs: Greetings vs Questions */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  id="subtab-greetings-btn"
                  onClick={() => setActiveSubTab('greetings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeSubTab === 'greetings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Greetings ({selectedRole?.greetingResponses.length})</span>
                </button>
                <button
                  id="subtab-questions-btn"
                  onClick={() => setActiveSubTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeSubTab === 'questions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Questions ({selectedRole?.questionResponses.length})</span>
                </button>
              </div>
            </div>

            {/* Active response file badge */}
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                responses/{selectedRole?.isBuiltIn ? '' : 'custom_'}{selectedRole?.id}_{activeSubTab}.txt
              </span>
              <span className="text-[11px] text-slate-500">Pick randomly when triggered</span>
            </div>

            {/* List of responses */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {currentResponses.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs rounded-lg border border-dashed border-slate-800">
                  No {activeSubTab} templates configured for this role yet. Add one below!
                </div>
              ) : (
                currentResponses.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 group hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Template #{idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{resp}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteResponse(idx)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Delete response"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Response Form */}
            <form onSubmit={handleAddResponse} className="mt-5 space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Add New {activeSubTab === 'greetings' ? 'Greeting' : 'Question'} Template:
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Tokens:</span>
                  <button
                    type="button"
                    onClick={() => insertToken('{username}')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[10px] cursor-pointer"
                  >
                    {'{username}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{bot_name}')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[10px] cursor-pointer"
                  >
                    {'{bot_name}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{streamer_name}')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[10px] cursor-pointer"
                  >
                    {'{streamer_name}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('{uptime}')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[10px] cursor-pointer"
                  >
                    {'{uptime}'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  id="new-response-template-input"
                  type="text"
                  value={newResponseText}
                  onChange={(e) => setNewResponseText(e.target.value)}
                  placeholder={`e.g. Welcome ${selectedRole?.name} {username}! Glad to see you on stream.`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  id="add-response-template-btn"
                  type="submit"
                  disabled={!newResponseText.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal: Create Custom Role */}
      {showNewRoleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Create Custom Role Tier</span>
              </h3>
              <button
                onClick={() => setShowNewRoleModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Name:</label>
                <input
                  id="custom-role-name-input"
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Legend, Champion, Raider..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Badge Text:</label>
                  <input
                    id="custom-role-badge-input"
                    type="text"
                    value={newRoleBadge}
                    onChange={(e) => setNewRoleBadge(e.target.value)}
                    placeholder="e.g. 🏆 LEGEND"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority Weight:</label>
                  <input
                    id="custom-role-priority-input"
                    type="number"
                    min="1"
                    max="99"
                    value={newRolePriority}
                    onChange={(e) => setNewRolePriority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description:</label>
                <input
                  id="custom-role-desc-input"
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="e.g. Dedicated monthly top supporters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewRoleModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  id="save-new-role-submit-btn"
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
