import React from 'react';

export default function Controls({ playing, onTogglePause, onRestart }) {
  return (
    <div className="flex items-center gap-3">
      <button
        className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
        onClick={onTogglePause}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
      <button
        className="px-3 py-1.5 rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-white transition shadow"
        onClick={onRestart}
      >
        Restart
      </button>
    </div>
  );
}
