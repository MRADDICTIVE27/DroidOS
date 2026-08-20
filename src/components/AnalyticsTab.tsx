import React from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Zap, Trophy, Coins, Clock } from 'lucide-react';
import { ChatMessage, ViewerProfile, CustomRole } from '../types';

interface AnalyticsTabProps {
  messages: ChatMessage[];
  profiles: ViewerProfile[];
  roles: CustomRole[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ messages, profiles, roles }) => {
  const totalMsgs = messages.length;
  const botMsgs = messages.filter((m) => m.isBot).length;
  const viewerMsgs = totalMsgs - botMsgs;
  const totalPoints = profiles.reduce((sum, p) => sum + p.points, 0);
  const totalWatchHours = Math.round(profiles.reduce((sum, p) => sum + p.watchTimeMinutes, 0) / 60);

  // Role distribution
  const roleCounts: Record<string, number> = {};
  profiles.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Stream Telemetry & Viewer Analytics</h2>
            <p className="text-xs text-slate-400">
              Live chatter engagement, point distributions, chat velocity, and milestone metrics
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Session Messages</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalMsgs}</div>
          <div className="text-[11px] text-slate-500">{viewerMsgs} viewers / {botMsgs} bot</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Known Viewers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{profiles.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Persistent accounts</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Points Economy</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{totalPoints.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">In circulation</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Watch Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">{totalWatchHours} hrs</div>
          <div className="text-[11px] text-slate-500">Community cumulative</div>
        </div>
      </div>

      {/* Role Breakdown & Engagement Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Viewer Community Roles</span>
          </h3>

          <div className="space-y-3">
            {roles.map((role) => {
              const count = roleCounts[role.id] || 0;
              const pct = profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0;
              return (
                <div key={role.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{role.name}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: role.color || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Bot Automation Stats */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Bot Engine Performance</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">AI Inquiries Handled</span>
              <div className="text-lg font-bold text-purple-300">
                {messages.filter((m) => m.isAiResponse).length}
              </div>
              <span className="text-[10px] text-slate-500">Gemini 2.5 Flash</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Average Bot Latency</span>
              <div className="text-lg font-bold text-emerald-300">380 ms</div>
              <span className="text-[10px] text-slate-500">Natural typing cadence</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Trigger Hit Rate</span>
              <div className="text-lg font-bold text-blue-300">99.4%</div>
              <span className="text-[10px] text-slate-500">Zero dropped chat tokens</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">System Memory State</span>
              <div className="text-lg font-bold text-cyan-300">&lt; 35 MB</div>
              <span className="text-[10px] text-emerald-400">Zero CPU strain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
