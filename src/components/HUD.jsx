import React from 'react';

export default function HUD({ score, lives, level, paused }) {
  return (
    <div className="pointer-events-none select-none w-full flex items-center justify-between text-white/90 font-semibold tracking-wide">
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 rounded bg-slate-900/60 backdrop-blur border border-white/10 shadow">Score: {score}</span>
        <span className="px-3 py-1 rounded bg-slate-900/60 backdrop-blur border border-white/10 shadow">Level: {level}</span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: lives }).map((_, i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
          />
        ))}
        <span className="ml-2 text-sm text-white/70">{paused ? 'Paused' : ''}</span>
      </div>
    </div>
  );
}
