import React, { useState } from 'react';
import { Clipboard, ExternalLink, Sparkles, Volume2, ShieldAlert, Award, Play, CheckCircle2, Monitor } from 'lucide-react';
import { dispatchOverlayAlert } from '../services/alertDispatcher';

export const ObsOverlayTab: React.FC = () => {
  const overlayUrl = `${window.location.origin}/overlay`;
  const [copied, setCopied] = useState(false);
  const [lastTested, setLastTested] = useState<string | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestRedeemAlert = async () => {
    setLastTested('Redeem Alert');
    await dispatchOverlayAlert({
      id: `test-redeem-${Date.now()}`,
      type: 'redeem',
      title: '🎉 JamesMaude redeemed "Hydrate Streamer"!',
      subtitle: 'STORE REDEMPTION',
      username: 'JamesMaude',
      customMessage: 'Take a big sip of water! Stay hydrated during the boss fight!',
      gifUrl: 'https://media.giphy.com/media/WGFdv6kbmAeVq2b7z3/giphy.gif',
      synthPreset: 'coin',
      pointsCost: 250,
      durationMs: 6000
    });
  };

  const handleTestShoutoutAlert = async () => {
    setLastTested('Shoutout Alert');
    await dispatchOverlayAlert({
      id: `test-shoutout-${Date.now()}`,
      type: 'shoutout',
      title: '🌟 Shoutout to @PixelKnight!',
      subtitle: 'VIP CREATOR SHOUTOUT',
      username: 'PixelKnight',
      customMessage: 'Check out their awesome stream at youtube.com/@PixelKnight! Huge supporter of the channel!',
      gifUrl: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
      synthPreset: 'fanfare',
      durationMs: 7000
    });
  };

  const handleTestSoundAlert = async () => {
    setLastTested('Sound Alert');
    await dispatchOverlayAlert({
      id: `test-sound-${Date.now()}`,
      type: 'sound',
      title: '🔊 Level Up Sound Activated!',
      subtitle: 'COMMUNITY SOUND FX',
      username: 'StreamViewer',
      gifUrl: 'https://media.giphy.com/media/l4KhQo2MESJkc6QbS/giphy.gif',
      synthPreset: 'level_up',
      durationMs: 5000
    });
  };

  const handleTestDuelAlert = async () => {
    setLastTested('Duel Alert');
    await dispatchOverlayAlert({
      id: `test-duel-${Date.now()}`,
      type: 'duel',
      title: '⚔️ DUEL CHALLENGE: @Shadow vs @Dragon!',
      subtitle: 'CHAT ARENA BATTLE',
      customMessage: 'Wager: 500 DroidCoins! Who will emerge victorious?!',
      gifUrl: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
      synthPreset: 'zap',
      durationMs: 6000
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">OBS Studio Browser Source Overlay</h2>
              <p className="text-xs text-slate-400">
                Display animated GIFs, store redeem alerts, VIP shoutouts, and sound effects directly on your stream broadcast.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Overlay Engine Ready
            </span>
          </div>
        </div>

        {/* URL Box */}
        <div className="mt-6 space-y-2">
          <label className="text-xs font-semibold text-slate-300">OBS Browser Source URL</label>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="text"
              readOnly
              value={overlayUrl}
              className="flex-grow p-3 bg-slate-950 text-indigo-300 rounded-xl border border-slate-700 font-mono text-xs sm:text-sm select-all focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={copyToClipboard}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-600/20 shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Clipboard className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
            <button
              onClick={() => window.open(overlayUrl, '_blank')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0"
              title="Open overlay in a test tab to see alerts live"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Tab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Alert Center */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Instant OBS Alert Tester
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any button below to immediately broadcast a test alert into your OBS Browser Source or Preview tab.
            </p>
          </div>
          {lastTested && (
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              Sent: {lastTested}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            onClick={handleTestRedeemAlert}
            className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-900/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🎁</span>
              <Play className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-xs font-bold text-white">Test Redeem & GIF</div>
            <div className="text-[10px] text-slate-400 mt-1">Triggers animated GIF popup + coin sound</div>
          </button>

          <button
            onClick={handleTestShoutoutAlert}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-950 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📢</span>
              <Play className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-xs font-bold text-white">Test VIP Shoutout</div>
            <div className="text-[10px] text-slate-400 mt-1">Triggers banner + fanfare + channel link</div>
          </button>

          <button
            onClick={handleTestSoundAlert}
            className="p-4 rounded-xl bg-gradient-to-br from-teal-900/40 to-slate-950 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-900/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🔊</span>
              <Play className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-xs font-bold text-white">Test Sound Effect</div>
            <div className="text-[10px] text-slate-400 mt-1">Plays synthesized Web Audio + visual pulse</div>
          </button>

          <button
            onClick={handleTestDuelAlert}
            className="p-4 rounded-xl bg-gradient-to-br from-rose-900/40 to-slate-950 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-900/60 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">⚔️</span>
              <Play className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-xs font-bold text-white">Test Duel Challenge</div>
            <div className="text-[10px] text-slate-400 mt-1">Displays battle banner + arena wager</div>
          </button>
        </div>
      </div>

      {/* OBS Setup Guide */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          Step-by-Step OBS Studio Setup Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-white">Add Browser Source</h4>
            <p className="text-slate-400">
              In OBS Studio, go to your Scenes list, click the <strong>+</strong> button under <strong>Sources</strong>, and select <strong>Browser</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-white">Configure Dimensions</h4>
            <p className="text-slate-400">
              Paste the URL copied above into the <strong>URL</strong> field. Set <strong>Width: 1920</strong> and <strong>Height: 1080</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-white">Audio & Refresh</h4>
            <p className="text-slate-400">
              Check <strong>"Control audio via OBS"</strong> if you want to mix alert sound in OBS, and check <strong>"Refresh browser when scene becomes active"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
