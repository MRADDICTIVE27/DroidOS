import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-400"/>
              <h2 className="text-lg font-extrabold text-white">Privacy Policy</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 space-y-4 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
          <p><strong>DroidOS</strong> respects your privacy and is designed to keep user data separated and secure.</p>

          <h3 className="text-white font-bold text-sm">1. Information We Collect</h3>
          <p>We may collect and store the following information when you use the app:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google account information required to sign in</li>
            <li>YouTube account access needed to read or post live chat messages</li>
            <li>User profile and configuration data</li>
            <li>Custom commands, bot settings, stream settings, and saved preferences</li>
            <li>AI usage data used to personalize bot behavior</li>
            <li>OBS connection settings if enabled by the user</li>
          </ul>

          <h3 className="text-white font-bold text-sm">2. How We Use Information</h3>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>create and manage your account</li>
            <li>connect your YouTube live chat and stream data</li>
            <li>enable your bot settings and custom commands</li>
            <li>personalize AI responses and bot behavior</li>
            <li>save your preferences across devices</li>
          </ul>

          <h3 className="text-white font-bold text-sm">3. Data Separation</h3>
          <p>Each user account is stored separately and is not shared across other users. Your personal data, settings, custom commands, and stream configuration are kept under your account and are not exposed to other accounts.</p>

          <h3 className="text-white font-bold text-sm">4. Third-Party Services</h3>
          <p>DroidOS may use:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Firebase for authentication and account data storage</li>
            <li>Google YouTube APIs for live chat and stream access</li>
            <li>Google AI services for AI reply generation</li>
            <li>OBS WebSocket if enabled for stream overlays and alerts</li>
          </ul>
          <p>These services are governed by their own privacy policies.</p>
        </div>
      </div>
    </div>
  );
};
