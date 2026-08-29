import React, { useState, useRef } from 'react';
import {
  Code,
  FileCode,
  Upload,
  Download,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles,
  Gamepad2,
  FileText,
  Copy,
  Check,
  Zap,
  Info,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ScriptPlugin, ScriptLanguage, ViewerProfile, EconomySettings } from '../types';
import { parseUploadedScriptFile, executePluginCommand } from '../services/pluginEngine';
import { soundSynth } from '../services/soundSynthesizer';

interface ScriptPluginsTabProps {
  plugins: ScriptPlugin[];
  onUpdatePlugins: (plugins: ScriptPlugin[]) => void;
  viewers: ViewerProfile[];
  economy: EconomySettings;
  streamerName: string;
  onSendChatMessage?: (content: string) => void;
}

const TEMPLATE_PYTHON = `# ====================================================================
# DroidOS Python Minigame Script
# Author: Streamer
# Version: 1.0.0
# Description: Custom Python chat minigame for DroidOS Workstation
# ====================================================================

import random

def on_command(user, cmd, args, droid):
    cmd = cmd.lower()
    
    if cmd == "!coinflip":
        choice = args[0].lower() if args else "heads"
        outcome = random.choice(["heads", "tails"])
        
        if choice == outcome:
            droid.add_points(user, 150)
            droid.play_sound("victory")
            droid.trigger_overlay({
                "type": "game",
                "title": "COINFLIP WON!",
                "subtitle": f"@{user} guessed {outcome.upper()} correctly! (+150 Coins)",
                "effect": "sparkles"
            })
            droid.send_chat(f"🪙 [COINFLIP] @{user} called {choice.upper()} and it landed on {outcome.upper()}! Won +150 DroidCoins! 🎉")
        else:
            droid.add_points(user, -50)
            droid.play_sound("airhorn")
            droid.send_chat(f"🪙 [COINFLIP] @{user} called {choice.upper()} but it landed on {outcome.upper()}! Lost 50 Coins! 😢")
`;

const TEMPLATE_CSHARP = `// ====================================================================
// DroidOS C# Minigame Script
// Author: Streamer
// Version: 1.0.0
// Description: Custom C# RPG chat game
// ====================================================================

using System;

public class CustomGamePlugin
{
    public static void OnCommand(string user, string cmd, string[] args, dynamic droid)
    {
        cmd = cmd.ToLower();

        if (cmd == "!chest")
        {
            Random rand = new Random();
            int roll = rand.Next(1, 100);

            if (roll > 70)
            {
                int gold = rand.Next(200, 800);
                droid.AddPoints(user, gold);
                droid.PlaySound("victory");
                droid.TriggerOverlay(new {
                    type = "game",
                    title = "TREASURE CHEST OPENED!",
                    subtitle = $"@{user} discovered a Legendary Chest with {gold} Coins!",
                    effect = "confetti"
                });
                droid.SendChat($"💎 @{user} opened a Mystic Chest and found {gold} DroidCoins! ✨");
            }
            else
            {
                droid.SendChat($"📦 @{user} opened a chest, but found only cobwebs and rusty nails!");
            }
        }
    }
}
`;

const TEMPLATE_JAVASCRIPT = `// ====================================================================
// DroidOS JavaScript Minigame Script
// Author: Streamer
// Version: 1.0.0
// Description: Custom interactive JavaScript chat logic
// ====================================================================

export function onCommand(user, cmd, args, droid) {
  cmd = cmd.toLowerCase();

  if (cmd === "!fortune") {
    const fortunes = [
      "Great wealth and victory await your next game!",
      "Beware of stream snipers in your immediate future.",
      "A massive raid of hype chatters is on the horizon!",
      "The next loot crate contains an ultra-rare drop."
    ];
    const picked = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    droid.playSound("coin");
    droid.sendChat(\`🔮 [FORTUNE TELLER] @\${user}: "\${picked}"\`);
  }
}
`;

export const ScriptPluginsTab: React.FC<ScriptPluginsTabProps> = ({
  plugins,
  onUpdatePlugins,
  viewers,
  economy,
  streamerName,
  onSendChatMessage
}) => {
  const [selectedPluginId, setSelectedPluginId] = useState<string>(plugins[0]?.id || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testCmd, setTestCmd] = useState('!scramble');
  const [testUser, setTestUser] = useState('PixelMaster');
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPluginName, setNewPluginName] = useState('Custom Minigame');
  const [newPluginLang, setNewPluginLang] = useState<ScriptLanguage>('python');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId) || plugins[0];

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parseUploadedScriptFile(file.name, content);
        const updated = [parsed, ...plugins];
        onUpdatePlugins(updated);
        setSelectedPluginId(parsed.id);
        soundSynth.play('victory');
      }
    };
    reader.readAsText(file);
  };

  const handleToggleEnabled = (id: string) => {
    const updated = plugins.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
    onUpdatePlugins(updated);
    soundSynth.play('coin');
  };

  const handleDeletePlugin = (id: string) => {
    const updated = plugins.filter((p) => p.id !== id);
    onUpdatePlugins(updated);
    if (selectedPluginId === id && updated.length > 0) {
      setSelectedPluginId(updated[0].id);
    }
    soundSynth.play('airhorn');
  };

  const handleCreateNewPlugin = () => {
    let starterCode = TEMPLATE_PYTHON;
    let ext = 'py';
    if (newPluginLang === 'csharp') {
      starterCode = TEMPLATE_CSHARP;
      ext = 'cs';
    } else if (newPluginLang === 'javascript') {
      starterCode = TEMPLATE_JAVASCRIPT;
      ext = 'js';
    }

    const filename = `${newPluginName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    const newP = parseUploadedScriptFile(filename, starterCode);
    newP.name = newPluginName;
    newP.author = streamerName || 'Streamer';

    const updated = [newP, ...plugins];
    onUpdatePlugins(updated);
    setSelectedPluginId(newP.id);
    setShowCreateModal(false);
    soundSynth.play('victory');
  };

  const handleDownloadPlugin = (plugin: ScriptPlugin) => {
    const blob = new Blob([plugin.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = plugin.filename;
    a.click();
    URL.revokeObjectURL(url);
    soundSynth.play('coin');
  };

  const handleRunSimulator = () => {
    if (!selectedPlugin) return;
    const parts = testCmd.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    const logEntry = `[${new Date().toLocaleTimeString()}] Executing '${testCmd}' as @${testUser}...`;
    setTestOutput((prev) => [logEntry, ...prev.slice(0, 19)]);

    executePluginCommand(selectedPlugin, testUser, cmd, args, {
      username: testUser,
      message: testCmd,
      command: cmd,
      args,
      viewers,
      economy,
      streamerName,
      onSendReply: (reply) => {
        setTestOutput((prev) => [`🤖 Bot Reply: ${reply}`, ...prev.slice(0, 19)]);
        if (onSendChatMessage) {
          // optionally send to chat monitor
        }
      },
      onUpdatePoints: (targetUser, delta) => {
        setTestOutput((prev) => [`🪙 Points Delta for @${targetUser}: ${delta > 0 ? '+' : ''}${delta}`, ...prev.slice(0, 19)]);
      },
      onTriggerOverlay: (alert) => {
        setTestOutput((prev) => [`📺 Overlay Alert Triggered: [${alert.type?.toUpperCase()}] ${alert.title} - ${alert.subtitle}`, ...prev.slice(0, 19)]);
      },
      onPlaySound: (sound) => {
        soundSynth.play(sound as any);
      }
    });
  };

  const copyCodeToClipboard = () => {
    if (!selectedPlugin) return;
    navigator.clipboard.writeText(selectedPlugin.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getLanguageBadge = (lang: ScriptLanguage) => {
    switch (lang) {
      case 'python':
        return { label: 'Python (.py)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🐍' };
      case 'csharp':
        return { label: 'C# (.cs)', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '⚡' };
      case 'javascript':
        return { label: 'JavaScript (.js)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '📜' };
      case 'typescript':
        return { label: 'TypeScript (.ts)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '🔷' };
      default:
        return { label: lang, bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: '📄' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/30 via-slate-900/50 to-cyan-900/30 border border-white/10 p-6 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                Custom Script Plugins & Minigames Engine
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                Python • C# • JS • TS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Upload your own Python (<code className="text-emerald-300">.py</code>) or C# (<code className="text-purple-300">.cs</code>) scripts. DroidOS automatically parses and connects custom chat minigames, point hooks, and overlay triggers!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Script (.py / .cs)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.cs,.js,.ts,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Script</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'bg-cyan-500/15 border-cyan-400 scale-[1.01]'
            : 'bg-white/[0.02] border-white/10 hover:border-purple-400/40 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐍</span>
          <span className="text-2xl">⚡</span>
          <span className="text-2xl">📜</span>
        </div>
        <div className="text-xs font-bold text-slate-200">
          Drag & Drop Python (<code className="text-emerald-400">.py</code>), C# (<code className="text-purple-400">.cs</code>), or JavaScript (<code className="text-amber-400">.js</code>) files here
        </div>
        <p className="text-[11px] text-slate-400">
          DroidOS immediately parses functions, registers chat commands, and loads event hooks with zero server setup required.
        </p>
      </div>

      {/* Main Grid: Plugin List & Script Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Installed Plugins List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Installed Script Plugins ({plugins.length})</span>
            </h3>
            <span className="text-[11px] text-purple-300 font-mono">
              {plugins.filter((p) => p.enabled).length} Active
            </span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {plugins.map((plugin) => {
              const isSelected = selectedPlugin?.id === plugin.id;
              const badge = getLanguageBadge(plugin.language);

              return (
                <div
                  key={plugin.id}
                  onClick={() => setSelectedPluginId(plugin.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-purple-900/20 border-purple-400/50 shadow-lg shadow-purple-900/30'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{badge.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug flex items-center gap-1.5">
                          <span>{plugin.name}</span>
                          {plugin.isBuiltIn && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded-md font-semibold">
                              Built-in
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">{plugin.filename}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(plugin.id);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          plugin.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {plugin.enabled ? 'Active' : 'Disabled'}
                      </button>

                      {!plugin.isBuiltIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlugin(plugin.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {plugin.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap text-[10px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {plugin.registeredCommands.slice(0, 3).map((cmd) => (
                        <span key={cmd} className="font-mono bg-white/[0.06] text-purple-200 px-1.5 py-0.5 rounded border border-white/10">
                          {cmd}
                        </span>
                      ))}
                      {plugin.registeredCommands.length > 3 && (
                        <span className="text-slate-400 font-mono">+{plugin.registeredCommands.length - 3}</span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">v{plugin.version}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Inspector, Metadata & Test Runner */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPlugin ? (
            <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.3)] space-y-5">
              {/* Plugin Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-extrabold text-white">{selectedPlugin.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLanguageBadge(selectedPlugin.language).bg}`}>
                      {getLanguageBadge(selectedPlugin.language).label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">By {selectedPlugin.author} • v{selectedPlugin.version}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {selectedPlugin.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyCodeToClipboard}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPlugin(selectedPlugin)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Registered Hooks & Commands Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Registered Chat Commands</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedPlugin.registeredCommands.map((cmd) => (
                      <span
                        key={cmd}
                        onClick={() => setTestCmd(cmd)}
                        className="font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-cyan-500/25 transition-colors"
                        title="Click to test in simulator"
                      >
                        {cmd}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Event Hooks & Overlays</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedPlugin.registeredHooks.map((hook) => (
                      <span key={hook} className="font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg text-[11px]">
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Display Sandbox Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-bold flex items-center gap-1.5 text-slate-200">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>{selectedPlugin.filename}</span>
                  </span>
                  <span>{selectedPlugin.code.split('\n').length} lines</span>
                </div>

                <div className="rounded-2xl bg-[#030712] border border-white/10 p-4 font-mono text-xs text-slate-200 max-h-[380px] overflow-y-auto overflow-x-auto selection:bg-purple-600/40">
                  <pre className="leading-relaxed whitespace-pre font-mono">
                    {selectedPlugin.code}
                  </pre>
                </div>
              </div>

              {/* Interactive Plugin Simulator & Test Console */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>Live Plugin Test Sandbox</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Simulate command execution without live stream</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={testUser}
                      onChange={(e) => setTestUser(e.target.value)}
                      placeholder="Viewer Username"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={testCmd}
                      onChange={(e) => setTestCmd(e.target.value)}
                      placeholder="e.g. !scramble, !guess MINECRAFT, !roulette 200"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      onClick={handleRunSimulator}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute</span>
                    </button>
                  </div>
                </div>

                {testOutput.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto">
                    {testOutput.map((line, idx) => (
                      <div key={idx} className="leading-snug">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <Code className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Script Plugin Selected</div>
              <p className="text-xs text-slate-400">Select or upload a Python/C# script from the list on the left.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Plugin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white">Create New Script Plugin</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Plugin Name</label>
                <input
                  type="text"
                  value={newPluginName}
                  onChange={(e) => setNewPluginName(e.target.value)}
                  placeholder="e.g. Coinflip Minigame, Trivia Challenge"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Programming Language</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewPluginLang('python')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      newPluginLang === 'python'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="text-xl mb-1">🐍</div>
                    <div>Python</div>
                    <div className="text-[10px] opacity-70">.py</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPluginLang('csharp')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      newPluginLang === 'csharp'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="text-xl mb-1">⚡</div>
                    <div>C#</div>
                    <div className="text-[10px] opacity-70">.cs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPluginLang('javascript')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      newPluginLang === 'javascript'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="text-xl mb-1">📜</div>
                    <div>JavaScript</div>
                    <div className="text-[10px] opacity-70">.js</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewPlugin}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-colors cursor-pointer"
              >
                Create Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
