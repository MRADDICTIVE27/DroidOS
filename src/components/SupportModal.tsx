import React, { useState } from 'react';
import { Heart, ExternalLink, Copy, Check, Sparkles, Coffee } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const kofiUrl = 'https://ko-fi.com/mraddictive';

  if (!isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(kofiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-600/20">
              <Heart className="w-6 h-6 fill-rose-500/30" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Support MRADDICTIVE</h2>
              <p className="text-xs text-slate-400">Empower DroidOS Development</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Primary Message */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-200 relative z-10 leading-relaxed">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-950/60 border border-rose-500/30 shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Direct Creator Support:</span>
            </div>
            <p className="text-slate-200 font-medium leading-relaxed">
              Please consider supporting <strong>MRADDICTIVE</strong> further by donating Here{' '}
              <a
                href={kofiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-400 hover:text-rose-300 underline font-bold"
              >
                https://ko-fi.com/mraddictive
              </a>{' '}
              - this enables more advanced features with bigger and better updates.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block">Your support powers:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              <li className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>OBS & Audio Expansions</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Smarter AI Bot Models</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Continuous Cloud Updates</span>
              </li>
              <li className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Lag Optimizations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
          <a
            href={kofiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer transition-all"
          >
            <Coffee className="w-4 h-4" />
            <span>Donate on Ko-fi (mraddictive)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={copyUrl}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
