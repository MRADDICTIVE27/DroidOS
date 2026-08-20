import React, { useState } from 'react';
import { Bot, Sparkles, Check, Sliders, MessageSquare, Zap } from 'lucide-react';
import { BotIdentity } from '../types';

interface BotIdentityTabProps {
  botIdentity: BotIdentity;
  setBotIdentity: React.Dispatch<React.SetStateAction<BotIdentity>>;
  onSaveNotice: () => void;
}

export const BotIdentityTab: React.FC<BotIdentityTabProps> = ({
  botIdentity,
  setBotIdentity,
  onSaveNotice
}) => {
  const [formState, setFormState] = useState<BotIdentity>(botIdentity);

  const handleChange = (field: keyof BotIdentity, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setBotIdentity(formState);
    onSaveNotice();
  };

  const applyPreset = (preset: 'streamer' | 'gaming' | 'cyberpunk' | 'helpful') => {
    if (preset === 'streamer') {
      setFormState((prev) => ({
        ...prev,
        botName: 'StreamBot',
        personalityTone: 'friendly',
        customSystemPrompt: 'You are StreamBot, an upbeat, welcoming stream assistant. You celebrate subs, welcome new viewers, and keep energy high!'
      }));
    } else if (preset === 'gaming') {
      setFormState((prev) => ({
        ...prev,
        botName: 'DroidGamer',
        personalityTone: 'witty',
        customSystemPrompt: 'You are DroidGamer, a witty, game-savvy stream bot. You joke about game plays, cheer on the streamer, and answer chat questions.'
      }));
    } else if (preset === 'cyberpunk') {
      setFormState((prev) => ({
        ...prev,
        botName: 'DroidOS-Core',
        personalityTone: 'cyberpunk',
        customSystemPrompt: 'You are DroidOS-Core, an advanced cybernetic AI. You speak in cool, concise tech terminology and assist the streamer.'
      }));
    } else if (preset === 'helpful') {
      setFormState((prev) => ({
        ...prev,
        botName: 'HelperBot',
        personalityTone: 'helpful',
        customSystemPrompt: 'You are HelperBot, an informative stream moderator bot. You answer stream FAQs, schedule questions, and provide chat rules.'
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bot Identity & AI Personality Engine</h2>
            <p className="text-xs text-slate-400">
              Customize bot naming, YouTube channel pairing, and Gemini AI prompt behaviors
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Save Identity Settings</span>
        </button>
      </div>

      {/* Preset Quick Chooser */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>One-Click Starter Presets:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('gaming')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            🎮 Witty Gamer Bot
          </button>
          <button
            onClick={() => applyPreset('streamer')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            ✨ Upbeat Community Bot
          </button>
          <button
            onClick={() => applyPreset('cyberpunk')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            🤖 Cybernetic Droid
          </button>
          <button
            onClick={() => applyPreset('helpful')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            🛡️ Helpful FAQ Bot
          </button>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Names & YouTube Channel Binding */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Channel & Bot Naming</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bot Name</label>
            <input
              type="text"
              value={formState.botName}
              onChange={(e) => handleChange('botName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. DroidBot"
            />
            <p className="text-[11px] text-slate-500 mt-1">Displayed in chat when answering stream viewers.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Streamer / Host Name</label>
            <input
              type="text"
              value={formState.streamerName}
              onChange={(e) => handleChange('streamerName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Streamer"
            />
            <p className="text-[11px] text-slate-500 mt-1">Referenced in &#123;streamer_name&#125; token substitutions.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">YouTube Channel Name</label>
            <input
              type="text"
              value={formState.channelName}
              onChange={(e) => handleChange('channelName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. My Stream Channel"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">AI Question Trigger Prefix</label>
            <input
              type="text"
              value={formState.aiCommandPrefix}
              onChange={(e) => handleChange('aiCommandPrefix', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="!ai"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Viewers type <code>{formState.aiCommandPrefix} &lt;question&gt;</code> to trigger real-time AI replies.
            </p>
          </div>
        </div>

        {/* Right Column: AI Persona & Behavior */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>AI Personality & Response Tones</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Personality Tone</label>
            <select
              value={formState.personalityTone}
              onChange={(e: any) => handleChange('personalityTone', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="witty">Witty & Energetic</option>
              <option value="friendly">Friendly & Warm</option>
              <option value="cyberpunk">Cybernetic Droid (Tech & Crisp)</option>
              <option value="helpful">Helpful & Informative</option>
              <option value="sarcastic">Playfully Sarcastic & Fun</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Custom System Instruction</label>
            <textarea
              rows={4}
              value={formState.customSystemPrompt}
              onChange={(e) => handleChange('customSystemPrompt', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
              placeholder="Define exact personality rules for the bot..."
            />
          </div>

          {/* Behavior Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>AI Brain Engine Mode</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleChange('aiBrainMode', 'local')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formState.aiBrainMode === 'local' 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span className="font-bold">Local Brain</span>
                  <span className="text-[9px] opacity-70">Free • Instant • Offline</span>
                </button>

                <button
                  onClick={() => handleChange('aiBrainMode', 'cloud')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    formState.aiBrainMode === 'cloud' 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">Cloud AI</span>
                  <span className="text-[9px] opacity-70">Gemini 3.7 • Needs Credits</span>
                </button>
              </div>

              <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed border ${
                formState.aiBrainMode === 'local' 
                  ? 'bg-blue-950/20 border-blue-500/20 text-blue-300' 
                  : 'bg-purple-950/20 border-purple-500/20 text-purple-300'
              }`}>
                {formState.aiBrainMode === 'local' 
                  ? "Local mode uses a high-speed template engine. It requires zero API credits and works entirely within the app. Great for reliability!"
                  : "Cloud mode uses advanced Gemini 3.7 Intelligence. It provides natural, flowing conversation but requires Google AI Studio prepayment credits."}
              </div>
            </div>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 cursor-pointer">
              <span className="text-slate-300 font-medium">Auto-Greet New Viewers</span>
              <input
                type="checkbox"
                checked={formState.autoGreeting}
                onChange={(e) => handleChange('autoGreeting', e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 cursor-pointer">
              <span className="text-slate-300 font-medium">Auto-Answer Viewer Questions</span>
              <input
                type="checkbox"
                checked={formState.autoQuestions}
                onChange={(e) => handleChange('autoQuestions', e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
