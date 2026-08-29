import React from 'react';
import { Shield, FileText, CheckCircle2, X, Scale, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Terms and Conditions (T&C)</h2>
              <p className="text-xs text-slate-400">Effective Date: August 2026 • DroidOS Workstation</p>
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
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Summary for Streamers
            </h3>
            <p className="text-slate-300">
              DroidOS is a local-first live stream automation workstation and OBS Browser Source provider. You retain 100% ownership of your stream content, custom bot response configurations, viewer data, and branding. DroidOS runs directly on your computer.
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. Acceptance of Terms</h4>
            <p>
              By accessing, downloading, bundling, or utilizing DroidOS (including web applet versions, standalone Windows executables, local Node.js servers, and OBS overlays), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. Permitted Use & Stream Automation</h4>
            <p>
              DroidOS is designed for streamers and content creators to manage chat games, custom bot responses, soundboard synthesis, channel point economies, viewer profiles, and OBS Studio visual overlays. You agree not to use DroidOS to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Violate the Terms of Service or Community Guidelines of YouTube, Twitch, Kick, or any connected streaming platform.</li>
              <li>Spam, harass, abuse, defraud, or broadcast hateful or unlawful content through automated bot responses.</li>
              <li>Distribute malicious payloads or disrupt unauthorized third-party computer systems.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. Local Data & Intellectual Property</h4>
            <p>
              All configurations saved in <code className="text-purple-300">CONFIG_AND_DATA</code> (including bot personalities, custom viewer facts, sound presets, and achievements) are stored locally on your machine. We claim no ownership over your broadcast creative assets, stream themes, or custom bot personas.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">4. Third-Party Services & Integrations</h4>
            <p>
              DroidOS interfaces with third-party software, notably:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>OBS Studio:</strong> Uses standard WebSocket protocol (v5.x) for local scene switching and browser source rendering.</li>
              <li><strong>YouTube API:</strong> Operates in compliance with YouTube API Services Terms of Service.</li>
            </ul>
            <p>
              We are not affiliated with, endorsed by, or sponsored by Google, YouTube, or OBS Project.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">5. Disclaimer of Warranties</h4>
            <p>
              DroidOS is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. We do not guarantee uninterrupted stream connectivity, zero broadcast latency, or error-free operation under volatile internet or hardware conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">6. Limitation of Liability</h4>
            <p>
              In no event shall the developers or contributors of DroidOS be liable for any direct, indirect, incidental, or consequential damages resulting from broadcast interruptions, lost stream revenue, channel suspensions, or hardware malfunction arising out of the use of this software.
            </p>
          </section>

          <section className="space-y-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-slate-900/40 to-cyan-500/15 border border-purple-500/30">
            <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4>7. Creator Attribution, Independent Passion Project & AI Development Transparency</h4>
            </div>
            <p className="text-slate-200 leading-relaxed italic bg-black/30 p-3.5 rounded-xl border border-white/10">
              "This project has been developed as an independent, passion-driven project. All creative concepts, architecture, and system designs are original creations developed with inspiration from contemporary streaming tools. AI assistance has been utilized strictly for code implementation and development acceleration. Substantial personal time, dedication, and resources have been invested into this platform; any support received directly fuels continuous development, feature expansion, and infrastructure enhancements."
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-white text-sm">8. Modifications to Terms</h4>
            <p>
              We reserve the right to revise these Terms and Conditions at any time. Continued use of the software after any modifications signifies your acceptance of the updated terms.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <span className="text-[11px] text-slate-400">DroidOS • Stream Automation System</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
