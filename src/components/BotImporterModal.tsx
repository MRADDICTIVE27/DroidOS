import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Clock,
  MessageSquareCode
} from 'lucide-react';
import {
  CustomCommand,
  AutomationTimer,
  AutoResponse,
  ImportTransferResult,
  SupportedBotSource
} from '../types';
import { convertExternalBotExport } from '../services/botImporterService';
import { soundSynth } from '../services/soundSynthesizer';

interface BotImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (commands: CustomCommand[], timers: AutomationTimer[], responses: AutoResponse[]) => void;
}

const SAMPLE_EXPORTS: Record<string, string> = {
  streamlabs: `[
  {"name": "!discord", "response": "Join our official community at https://discord.gg/streamer", "userlevel": "everyone", "cooldown": 15},
  {"name": "!points", "response": "@{user}, you have $(points) stream coins in your wallet!", "userlevel": "everyone", "cooldown": 5},
  {"name": "!shoutout", "response": "Huge shoutout to @$(touser)! Drop them a follow at https://youtube.com/@$(touser)", "userlevel": "moderator", "cooldown": 10},
  {"name": "!customapi", "response": "$(urlfetch https://api.weather.com/mycity)", "userlevel": "everyone", "cooldown": 30}
]`,
  nightbot: `!socials Follow our Twitter & YouTube at @StreamerName
!lurk $(user) is now lurking in the shadows and supporting the stream! $(points)
!hug $(user) gives a warm fuzzy hug to $(touser)!
!song $(urlfetch https://api.nightbot.tv/song)`,
  mixitup: `[
  {"command": "!heist", "response": "Bank heist initiated by {user}! Type !join to jump into the getaway van with {points} points.", "userLevel": "everyone"},
  {"command": "!schedule", "response": "We stream Monday, Wednesday, and Friday at 7 PM EST! {channel}", "userLevel": "everyone"}
]`
};

export const BotImporterModal: React.FC<BotImporterModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedBotPreset, setSelectedBotPreset] = useState<SupportedBotSource>('streamlabs');
  const [result, setResult] = useState<ImportTransferResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
        processConversion(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const processConversion = (content: string, filename?: string) => {
    if (!content.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const transferResult = convertExternalBotExport(content, filename);
      setResult(transferResult);
      setIsProcessing(false);
      if (transferResult.transferredCount > 0) {
        soundSynth.play('victory');
      } else {
        soundSynth.play('airhorn');
      }
    }, 300);
  };

  const handleApplyImport = () => {
    if (!result) return;
    onImportSuccess(result.transferredCommands, result.transferredTimers, result.transferredResponses);
    soundSynth.play('victory');
    onClose();
  };

  const loadSample = (botKey: string) => {
    const sample = SAMPLE_EXPORTS[botKey] || SAMPLE_EXPORTS.streamlabs;
    setInputText(sample);
    processConversion(sample, `${botKey}_export.json`);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <RefreshCw className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Cross-Bot Migration & Command Converter</h2>
              <p className="text-xs text-slate-400">
                Import and auto-convert commands from Streamlabs, Nightbot, Mix It Up, StreamElements & Moobot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Quick Presets Bar */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Source Bot Preset or Load Sample
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadSample('streamlabs')}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-cyan-300">Streamlabs</div>
                <div className="text-[10px] text-slate-400">JSON / Cloudbot</div>
              </button>

              <button
                type="button"
                onClick={() => loadSample('nightbot')}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-purple-300">Nightbot</div>
                <div className="text-[10px] text-slate-400">Text / JSON</div>
              </button>

              <button
                type="button"
                onClick={() => loadSample('mixitup')}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-emerald-300">Mix It Up</div>
                <div className="text-[10px] text-slate-400">.bot / JSON</div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload File</span>
                </div>
                <div className="text-[10px] text-purple-300">.json, .csv, .txt, .bot</div>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.txt,.bot,.xml"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Paste / Edit Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-bold">Paste Export Data or Commands List</span>
              <span>Supports $(user), $(points), $(touser), $(channel) tokens</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                processConversion(e.target.value);
              }}
              placeholder="Paste JSON array, CSV, or command text lines here..."
              className="w-full h-36 px-3.5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-400 selection:bg-purple-600/40 leading-relaxed resize-none"
            />
          </div>

          {/* Transfer Report Card */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">Migration Conversion Report</span>
                    <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {result.sourceBot}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold">
                    <span className="text-emerald-400">{result.transferredCount} of {result.totalFound} items successfully transferred</span>
                  </div>
                </div>

                {/* Transferred items breakdown badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-xl">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>{result.transferredCommands.length} Commands</span>
                  </div>
                  {result.transferredTimers.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-3 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{result.transferredTimers.length} Timers</span>
                    </div>
                  )}
                  {result.transferredResponses.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-xl">
                      <MessageSquareCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>{result.transferredResponses.length} Auto-Responses</span>
                    </div>
                  )}
                </div>

                {/* Failed / Could Not Transfer Section (Matches exact phrasing requirement) */}
                {result.failedCount > 0 && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                    <div className="font-bold text-red-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Could not transfer ({result.failedCount} item{result.failedCount > 1 ? 's' : ''}):</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300 pl-2">
                      {result.errors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span>
                            <strong className="text-white">{err.item}:</strong> {err.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Preview List of Converted Commands */}
              {result.transferredCommands.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Converted Commands Preview
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {result.transferredCommands.map((cmd, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-mono font-bold text-cyan-300">{cmd.command}</div>
                          <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">{cmd.response}</div>
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                          {cmd.userLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <span className="text-[11px] text-slate-400">
            {result ? `${result.transferredCount} items ready to merge` : 'Paste export data to convert'}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyImport}
              disabled={!result || result.transferredCount === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Merge into DroidOS Live Bot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
