import React, { useEffect, useState } from 'react';
import { subscribeToOverlayAlerts, OverlayAlert } from '../services/alertDispatcher';
import { playCustomAudioUrl, playSynthesizedSound } from '../services/soundService';

export const Overlay: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<OverlayAlert | null>(null);
  const [showStatusPing, setShowStatusPing] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('🟢 DroidOS Overlay Active & Connected');

  useEffect(() => {
    // Hide initial status banner after 6 seconds
    const statusTimer = setTimeout(() => {
      setShowStatusPing(false);
    }, 6000);

    const unsubscribe = subscribeToOverlayAlerts((alert) => {
      console.log('[OBS Overlay] Received alert:', alert);
      setActiveAlert(alert);
      setShowStatusPing(false);

      // Play audio if specified
      if (alert.audioUrl) {
        playCustomAudioUrl(alert.audioUrl, alert.volume || 0.6);
      } else if (alert.synthPreset) {
        playSynthesizedSound(alert.synthPreset, alert.volume || 0.6);
      }

      // Hide after duration
      const duration = alert.durationMs || 5000;
      setTimeout(() => {
        setActiveAlert((current) => (current?.id === alert.id ? null : current));
      }, duration);
    });

    return () => {
      clearTimeout(statusTimer);
      unsubscribe();
    };
  }, []);

  return (
    <div
      id="droidos-obs-overlay-root"
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none select-none bg-transparent flex flex-col items-center justify-center p-8"
    >
      {/* Ready Status Ping (Visible briefly on load so streamer knows OBS source is active) */}
      {showStatusPing && !activeAlert && (
        <div
          id="overlay-status-banner"
          className="fixed top-6 left-6 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md transition-opacity duration-700 animate-pulse"
        >
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold font-mono tracking-wide">{statusMessage}</span>
        </div>
      )}

      {/* Active Alert Card */}
      {activeAlert && (
        <div
          key={activeAlert.id}
          id="overlay-alert-container"
          className="relative max-w-xl w-full flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-slate-950/92 border-2 border-indigo-500/80 shadow-[0_0_50px_rgba(99,102,241,0.4)] backdrop-blur-xl animate-in zoom-in-95 fade-in duration-300"
        >
          {/* GIF or Media Visual */}
          {activeAlert.gifUrl && (
            <div className="relative mb-4 max-h-[360px] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src={activeAlert.gifUrl}
                alt={activeAlert.title}
                referrerPolicy="no-referrer"
                className="w-auto h-auto max-h-[320px] object-contain rounded-2xl"
              />
            </div>
          )}

          {/* Alert Header / Subtitle */}
          {activeAlert.subtitle && (
            <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-1 px-3 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60">
              {activeAlert.subtitle}
            </div>
          )}

          {/* Alert Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md my-1">
            {activeAlert.title}
          </h1>

          {/* User message or description */}
          {activeAlert.customMessage && (
            <p className="text-base font-semibold text-slate-200 mt-2 max-w-md bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              "{activeAlert.customMessage}"
            </p>
          )}

          {/* Points / Badge Tag */}
          {activeAlert.pointsCost !== undefined && (
            <div className="mt-3 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-600/50 px-3 py-1 rounded-full">
              🪙 Cost: {activeAlert.pointsCost} Points
            </div>
          )}

          {/* Dynamic Progress Bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              style={{
                animation: `shrinkWidth ${activeAlert.durationMs || 5000}ms linear forwards`
              }}
            />
          </div>
        </div>
      )}

      {/* Global CSS animation for progress shrink */}
      <style>{`
        @keyframes shrinkWidth {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
};
