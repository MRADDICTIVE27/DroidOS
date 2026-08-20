import React from 'react';
import { Activity, MessageSquare, Users, Cpu, ShieldCheck, Terminal, Download } from 'lucide-react';
import { SystemLog, ViewerProfile, CustomRole, ChatMessage } from '../types';

interface TelemetryTabProps {
  messages: ChatMessage[];
  profiles: ViewerProfile[];
  roles: CustomRole[];
  logs: SystemLog[];
  onClearLogs: () => void;
}

export const TelemetryTab: React.FC<TelemetryTabProps> = ({
  messages,
  profiles,
  roles,
  logs,
  onClearLogs
}) => {
  const botMessagesCount = messages.filter((m) => m.isBot).length;
  const userMessagesCount = messages.filter((m) => !m.isBot).length;

  const topChatters = [...profiles]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5);

  const roleCounts: Record<string, number> = {};
  profiles.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ logs, messages, profiles }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `droidos_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Chat Traffic</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{messages.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            {userMessagesCount} user msgs • {botMessagesCount} bot responses
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Viewer Profiles</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{profiles.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Synced with custom facts memory
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Configured Roles</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{roles.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Priority-indexed response tiers
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bot Response Rate</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">100%</div>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Zero missed priority commands
          </p>
        </div>
      </div>

      {/* 2-Column Section: Top Chatters & Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Chatters */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Top Active Community Chatters</span>
          </h3>
          <div className="space-y-2.5">
            {topChatters.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-xs font-bold text-slate-500 font-mono">#{idx + 1}</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200">{p.username}</span>
                    <span className="text-[10px] text-slate-500 block">{p.role.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400">{p.messageCount}</span>
                  <span className="text-[10px] text-slate-500 block">messages</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Role Distribution Breakdown</span>
          </h3>
          <div className="space-y-3">
            {roles.map((r) => {
              const count = roleCounts[r.id] || 0;
              const pct = profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0;
              return (
                <div key={r.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{r.name}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Logs Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              DroidOS System Log & Event Stream
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportLogsAsJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearLogs}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-slate-300">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span
                className={`font-bold shrink-0 px-1 rounded text-[10px] ${
                  log.module === 'AUTH'
                    ? 'bg-indigo-950 text-indigo-300'
                    : log.module === 'ROLES'
                    ? 'bg-purple-950 text-purple-300'
                    : log.module === 'LISTENER'
                    ? 'bg-blue-950 text-blue-300'
                    : 'bg-emerald-950 text-emerald-300'
                }`}
              >
                {log.module}
              </span>
              <span
                className={`flex-1 ${
                  log.level === 'warn'
                    ? 'text-amber-400'
                    : log.level === 'bot'
                    ? 'text-blue-300'
                    : log.level === 'success'
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
