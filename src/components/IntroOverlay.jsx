import React from 'react';

export default function IntroOverlay({ onStart }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="max-w-lg text-center px-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Starfall Barrage</h1>
        <p className="text-white/80 mb-6">A fast-paced bullet-hell where meteors rain and enemy fighters unleash dazzling patterns. Pilot your ship, weave through the storm, and chase a high score.</p>
        <ul className="text-left text-white/80 mb-6 space-y-1">
          <li>Move: Arrow Keys or WASD</li>
          <li>Shoot: Space</li>
          <li>Tip: Your hitbox is small—thread the needle!</li>
        </ul>
        <button
          onClick={onStart}
          className="px-5 py-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
