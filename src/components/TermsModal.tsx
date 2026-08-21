import React from 'react';
import { FileText, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-400"/>
              <h2 className="text-lg font-extrabold text-white">Terms and Conditions</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 space-y-4 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
          <p>Last updated: 2026-08-21</p>
          <p>By using DroidOS, you agree to the following terms.</p>

          <h3 className="text-white font-bold text-sm">1. Service Overview</h3>
          <p>DroidOS is a stream management and chat automation tool designed to help creators manage chat, commands, overlays, points, and AI-assisted responses for live streams.</p>

          <h3 className="text-white font-bold text-sm">2. User Responsibilities</h3>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>using the app in accordance with applicable law</li>
            <li>ensuring you have the rights to connect the Google and YouTube accounts you use</li>
            <li>complying with Google, YouTube, Firebase, and third-party platform policies</li>
          </ul>

          <h3 className="text-white font-bold text-sm">3. No Warranty</h3>
          <p>The app is provided on an “as is” basis. We do not guarantee uninterrupted service, bug-free operation, or specific results from AI or stream automation.</p>
        </div>
      </div>
    </div>
  );
};
