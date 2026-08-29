import React, { useState } from 'react';
import { version } from '../../package.json';

interface DroidOsLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const DroidOsLogo: React.FC<DroidOsLogoProps> = ({
  className = '',
  size = 'md',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.35)] shrink-0 overflow-hidden flex items-center justify-center`}
      >
        {!imgError ? (
          <img
            src="/logo.png"
            alt="DroidOS Official Logo"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#0b0f19] rounded-full flex flex-col items-center justify-center relative overflow-hidden border border-cyan-400/30">
            {/* SVG Fallback */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="46" stroke="url(#ringGrad)" strokeWidth="3" fill="#0f172a" />
              {/* 3D Isometric 'D' */}
              <path
                d="M32 25 H 52 C 66 25 74 35 74 50 C 74 65 66 75 52 75 H 32 Z"
                fill="url(#dGrad)"
              />
              <path
                d="M44 38 H 50 C 58 38 62 43 62 50 C 62 57 58 62 50 62 H 44 Z"
                fill="#0b0f19"
              />
              <line x1="28" y1="79" x2="48" y2="79" stroke="#22d3ee" strokeWidth="2" />
              <line x1="52" y1="79" x2="72" y2="79" stroke="#c084fc" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5 font-black tracking-widest text-sm text-white">
            <span className="text-cyan-400">DROID</span>
            <span className="text-purple-400">OS</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              v{version}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">By MRADDICTIVE</div>
        </div>
      )}
    </div>
  );
};
