import React, { useState } from 'react';
import { Sparkles, Bot, Radio, Check, RotateCcw } from 'lucide-react';
import { BotIdentity, StreamLiveMetadata } from '../types';

interface CleanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  botIdentity: BotIdentity;
  setBotIdentity: React.Dispatch<React.SetStateAction<BotIdentity>>;
  streamMetadata: StreamLiveMetadata;
  setStreamMetadata: React.Dispatch<React.SetStateAction<StreamLiveMetadata>>;
  onResetAllData: () => void;
}

export const CleanSetupModal: React.FC<CleanSetupModalProps> = ({
  isOpen,
  onClose,
  botIdentity,
  setBotIdentity,
  streamMetadata,
  setStreamMetadata,
  onResetAllData
}) => {
  const [streamerName, setStreamerName] = useState(botIdentity.streamerName);
  const [channelName, setChannelName] = useState(botIdentity.channelName);
  const [botName, setBotName] = useState(botIdentity.botName);
  const [streamTitle, setStreamTitle] = useState(streamMetadata.streamTitle);
  const [personalityTone, setPersonalityTone] = useState(botIdentity.personalityTone);

  if (!isOpen) return null;

  const handleApply = () => {
    setBotIdentity((prev) => ({
      ...prev,
      streamerName: streamerName.trim() || 'Streamer',
      channelName: channelName.trim() || 'My Stream Channel',
      botName: botName.trim() || 'DroidBot',
      personalityTone
    }));

    setStreamMetadata((prev) => ({
      ...prev,
      streamTitle: streamTitle.trim() || '🔴 Live Stream Broadcast'
    }));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Clean Package Quick Setup</h2>
              <p className="text-xs text-slate-400">Zero personal data • Ready for any new creator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm cursor-pointer">
            ✕
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-200">
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-blue-200 text-xs leading-relaxed">
            ✨ <strong>Privacy-First:</strong> DroidOS runs completely locally in low-resource mode with zero hardcoded accounts. Customize your stream profile below:
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Streamer Name</label>
              <input
                type="text"
                value={streamerName}
                onChange={(e) => setStreamerName(e.target.value)}
                placeholder="e.g. AlexPlayz"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">YouTube Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. Alex Gaming Live"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bot Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. DroidBot"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bot Personality Tone</label>
              <select
                value={personalityTone}
                onChange={(e: any) => setPersonalityTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="witty">Witty & Energetic</option>
                <option value="friendly">Friendly & Warm</option>
                <option value="cyberpunk">Cyberpunk Droid</option>
                <option value="helpful">Helpful & Informative</option>
                <option value="sarcastic">Playfully Sarcastic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Live Stream Title</label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="e.g. 🔴 Playing New Game + Interacting with Chat!"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset all roles, profiles, and commands back to factory clean package?')) {
                onResetAllData();
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Factory Reset State</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
