import React from 'react';
import { ShieldCheck, Lock, EyeOff, HardDrive, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Privacy Policy</h2>
              <p className="text-xs text-slate-400">Effective Date: August 2026 • Local-First Privacy Protection</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Privacy First Architecture
            </h3>
            <p className="text-slate-300">
              DroidOS does not collect, sell, or transmit your personal data, viewer chat logs, or channel statistics to external ad networks or third-party servers. All data stays strictly on your local computer or within your direct session.
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. Data Storage & Local Files</h4>
            <p>
              When running DroidOS on your Windows PC, all database states (including viewer loyalty points, custom memory facts, response styles, and redeem triggers) are stored in human-readable JSON files inside your local <code className="text-cyan-300">CONFIG_AND_DATA/</code> folder:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><code className="text-slate-200">1_AUTH_AND_KEYS/secrets.json</code>: Local keys & tokens (never sent to telemetry).</li>
              <li><code className="text-slate-200">2_BOT_RESPONSES/</code>: Custom prompt templates and AI personalities.</li>
              <li><code className="text-slate-200">3_REDEEMS_AND_SOUNDS/redeems.json</code>: Soundboard settings & hotkeys.</li>
              <li><code className="text-slate-200">4_VIEWER_PROFILES/viewers.json</code>: Loyalty points and chatter memories.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. YouTube & Streaming Platform Data</h4>
            <p>
              When connected to YouTube Live or streaming channels:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Chat messages are processed in real-time in memory for bot trigger matches and command execution.</li>
              <li>Public chatter display names and profile handles are used exclusively to award channel points, deliver shoutouts, and trigger achievements on your OBS overlay.</li>
              <li>We do not build commercial tracking profiles or sell viewer identities.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. OBS WebSocket Security</h4>
            <p>
              OBS WebSocket connections operate exclusively over your local network interface (<code className="text-cyan-300">localhost:4455</code> or your specified local IP). WebSocket authentication passwords are saved locally and are never transmitted outside your machine.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">4. Cookies and Web Storage</h4>
            <p>
              The web applet uses standard browser <code className="text-slate-200">localStorage</code> solely to preserve active UI preferences (e.g. selected bot personality, active audio volume, customized shoutout themes). No tracking cookies or advertising pixels are used.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">5. Data Deletion & Export</h4>
            <p>
              Because you possess 100% control over local storage, you may export your complete database at any time using the <strong>Windows App Package Export</strong> or delete the <code className="text-slate-200">CONFIG_AND_DATA/</code> directory to permanently erase all stored viewer records.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">6. Contact Information</h4>
            <p>
              If you have any questions or privacy inquiries regarding DroidOS, you can open an issue or reach out via our community project repository or Ko-fi support page.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <span className="text-[11px] text-slate-400">100% Local-First • Zero Cloud Tracking</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
