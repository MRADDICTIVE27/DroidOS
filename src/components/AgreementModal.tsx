import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Bot, Check, X, ExternalLink, Lock, FileText, AlertTriangle, Sparkles } from 'lucide-react';

interface AgreementModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({ isOpen, onAccept }) => {
  const [hasDeclined, setHasDeclined] = useState<boolean>(false);
  const [hasScrolledBottom, setHasScrolledBottom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 40) {
      setHasScrolledBottom(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      {hasDeclined ? (
        /* Blocked Access Screen upon Declining */
        <div className="bg-slate-900 border border-rose-600/40 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-white">Access Denied: EULA Required</h2>
            <p className="text-xs text-rose-300 font-semibold leading-relaxed">
              Sorry, you need to accept the EULA (End User License Agreement) and Terms & Conditions before accessing the app.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 text-left space-y-2 leading-relaxed">
            <p>
              <strong>DroidOS</strong> is proprietary software created and solely owned by <strong className="text-slate-200">MRADDICTIVE</strong>.
            </p>
            <p>
              To ensure data protection, YouTube API compliance, and intellectual property respect, acceptance of the license terms is required before launching the workspace.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setHasDeclined(false)}
              className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Review & Accept EULA</span>
            </button>
          </div>
        </div>
      ) : (
        /* Professional Terms & Conditions Modal */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">Terms & Conditions & End-User License Agreement</h2>
                </div>
                <p className="text-xs text-slate-400">
                  DroidOS • Sole Ownership & Intellectual Property of <strong className="text-blue-400">MRADDICTIVE</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable EULA Body */}
          <div
            onScroll={handleScroll}
            className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-950/90 p-5 rounded-2xl border border-slate-800/80 overflow-y-auto max-h-[380px] scrollbar-thin"
          >
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Please carefully read the terms governing your use of <strong>DroidOS</strong>. By clicking "Accept & Proceed", you agree to be bound by this Agreement.
              </span>
            </div>

            {/* Section 1 */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Sole Ownership & Intellectual Property Rights</span>
              </h3>
              <p>
                <strong>MRADDICTIVE</strong> is the sole and exclusive owner of all rights, titles, and interests in and to <strong>DroidOS</strong>, including all source code, software architecture, user interface designs, sound synthesis subroutines, AI integration algorithms, documentation, logos, and trademarks.
              </p>
              <p className="text-slate-400">
                All rights not expressly granted under this agreement are strictly reserved by MRADDICTIVE. No title or intellectual property rights are transferred to the end-user.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Grant of License & Acceptable Use</span>
              </h3>
              <p>
                MRADDICTIVE grants you a limited, non-exclusive, non-transferable, revocable license to utilize DroidOS for live stream chat moderation, community viewer points management, and broadcast automation.
              </p>
              <p className="text-slate-400">
                You agree not to modify, reverse engineer, decompile, distribute, rent, sublicense, or create derivative works of DroidOS without explicit prior written authorization from MRADDICTIVE.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Privacy Guarantee & Zero Personal Data Leakage</span>
              </h3>
              <p>
                DroidOS operates with a strictly client-first, secure local architecture. Your YouTube channel credentials, bot authentication tokens, viewer memory profiles, and custom commands are stored securely within your localized workspace state and never exfiltrated to third parties.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>4. YouTube API Services & Third-Party Terms</span>
              </h3>
              <p>
                By connecting your YouTube Broadcaster and YouTube Bot accounts, you agree to adhere to the YouTube Terms of Service and Google Developer Policies. DroidOS operates as an assistive automation layer.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>5. Disclaimer of Warranties & Limitation of Liability</span>
              </h3>
              <p className="text-slate-400">
                DroidOS is provided "AS IS" without warranties of any kind, whether express or implied. In no event shall MRADDICTIVE be liable for any damages arising out of the use or inability to use this software.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                6. Creator Support & Contact
              </h3>
              <p className="text-slate-400">
                Created by <strong>MRADDICTIVE</strong>. Support ongoing updates and feature development by donating at{' '}
                <a
                  href="https://ko-fi.com/mraddictive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 underline hover:text-rose-300 font-semibold inline-flex items-center gap-1"
                >
                  https://ko-fi.com/mraddictive <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              id="decline-agreement-btn"
              type="button"
              onClick={() => setHasDeclined(true)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Decline</span>
            </button>

            <button
              id="accept-agreement-btn"
              type="button"
              onClick={onAccept}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Accept Terms & Launch DroidOS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
