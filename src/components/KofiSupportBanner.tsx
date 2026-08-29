import React, { useState } from 'react';
import { Coffee, Heart, Sparkles, ExternalLink, X, Check, Gift, Star, ShieldCheck } from 'lucide-react';

interface KofiSupportBannerProps {
  onOpenDonateModal?: () => void;
}

export const KofiSupportBanner: React.FC<KofiSupportBannerProps> = ({ onOpenDonateModal }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSupporterModal, setShowSupporterModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const kofiUrl = 'https://ko-fi.com/mraddictive';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(kofiUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF5E5B]/20 hover:bg-[#FF5E5B]/30 border border-[#FF5E5B]/40 text-[#FF8E8B] text-xs font-bold shadow-lg backdrop-blur-xl transition-all cursor-pointer hover:scale-105"
        title="Show Ko-fi Support Banner"
      >
        <Coffee className="w-4 h-4 text-[#FF5E5B] animate-bounce" />
        <span>Support MRADDICTIVE</span>
      </button>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF5E5B]/15 via-purple-600/10 to-cyan-500/10 border border-[#FF5E5B]/30 p-4 sm:p-5 shadow-[0_12px_30px_rgba(255,94,91,0.15)] backdrop-blur-2xl transition-all">
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#FF5E5B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5E5B] to-[#FF8E8B] flex items-center justify-center text-white shadow-lg shadow-[#FF5E5B]/30 shrink-0 border border-white/20">
              <Coffee className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>Support MRADDICTIVE & DroidOS</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF5E5B] text-white uppercase tracking-wider">
                    Ko-fi
                  </span>
                </h3>
                <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" /> Creator Supported
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Enjoying DroidOS? If this workstation powers your stream, buy a coffee to support MRADDICTIVE and fuel continuous new features, sound synthesis, and chat tools!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowSupporterModal(true)}
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
            >
              <Gift className="w-3.5 h-3.5 text-purple-300" />
              <span>Perks & Tiers</span>
            </button>

            <a
              href="https://ko-fi.com/mraddictive"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5E5B] to-[#ff423e] hover:from-[#ff4743] hover:to-[#e63632] text-white text-xs font-black shadow-lg shadow-[#FF5E5B]/30 border border-[#FF8E8B]/40 transition-all transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              <span>Buy a Coffee ($3)</span>
              <ExternalLink className="w-3 h-3 text-white/80" />
            </a>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ko-fi Support Modal */}
      {showSupporterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-[#FF5E5B]/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5E5B]/20 border border-[#FF5E5B]/40 flex items-center justify-center text-[#FF5E5B]">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Support MRADDICTIVE on Ko-fi</h3>
                  <p className="text-xs text-slate-400">Fueling independent streamer tools & workstation development</p>
                </div>
              </div>

              <button
                onClick={() => setShowSupporterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose a supporter tier to support MRADDICTIVE and future DroidOS updates, custom overlay presets, sound synthesis effects, and chat features.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <a
                  href="https://ko-fi.com/mraddictive"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-[#FF5E5B]/15 border border-white/10 hover:border-[#FF5E5B]/40 text-center space-y-1.5 transition-all group cursor-pointer"
                >
                  <div className="text-2xl">☕</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#FF8E8B]">Single Espresso</div>
                  <div className="text-sm font-extrabold text-[#FF5E5B]">$3.00</div>
                  <div className="text-[10px] text-slate-400">Heartfelt gratitude & shoutout in stream</div>
                </a>

                <a
                  href="https://ko-fi.com/mraddictive"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-[#FF5E5B]/10 hover:bg-[#FF5E5B]/20 border border-[#FF5E5B]/30 hover:border-[#FF5E5B]/60 text-center space-y-1.5 transition-all group cursor-pointer relative"
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase">
                    Popular
                  </span>
                  <div className="text-2xl">☕☕</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#FF8E8B]">Double Shot</div>
                  <div className="text-sm font-extrabold text-[#FF5E5B]">$6.00</div>
                  <div className="text-[10px] text-slate-300">Supporter badge & priority feature suggestions</div>
                </a>

                <a
                  href="https://ko-fi.com/mraddictive"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-[#FF5E5B]/15 border border-white/10 hover:border-[#FF5E5B]/40 text-center space-y-1.5 transition-all group cursor-pointer"
                >
                  <div className="text-2xl">🚀</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#FF8E8B]">VIP Sponsor</div>
                  <div className="text-sm font-extrabold text-[#FF5E5B]">$15.00+</div>
                  <div className="text-[10px] text-slate-400">Permanent VIP credit & exclusive perks</div>
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ko-fi Direct Profile:
                </span>
                <span className="font-mono text-purple-300">{kofiUrl}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Ko-fi Link'}</span>
                </button>
                <a
                  href="https://ko-fi.com/mraddictive"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-[#FF5E5B] hover:bg-[#ff4642] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5E5B]/20 cursor-pointer transition-colors"
                >
                  <span>Open in Ko-fi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
