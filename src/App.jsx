import React, { useCallback, useEffect, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Controls from './components/Controls';
import IntroOverlay from './components/IntroOverlay';

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [intro, setIntro] = useState(true);

  // Level progression every 20 seconds while playing
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setLevel((l) => l + 1), 20000);
    return () => clearInterval(id);
  }, [playing]);

  const onStart = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setIntro(false);
    setPlaying(true);
  }, []);

  const onRestart = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlaying(true);
  }, []);

  const onTogglePause = useCallback(() => {
    if (intro) return;
    setPlaying((p) => !p);
  }, [intro]);

  // Keyboard quick pause (P)
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === 'p') {
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleScore = useCallback((s) => setScore(s), []);
  const handleLifeLost = useCallback((l) => setLives(Math.max(0, l)), []);
  const handleGameOver = useCallback(() => {
    setPlaying(false);
    setIntro(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 h-screen flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <HUD score={score} lives={lives} level={level} paused={!playing && !intro} />
          <Controls playing={playing} onTogglePause={onTogglePause} onRestart={onRestart} />
        </div>

        <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <GameCanvas
            playing={playing}
            level={level}
            onScore={handleScore}
            onLifeLost={handleLifeLost}
            onGameOver={handleGameOver}
          />
          {intro && <IntroOverlay onStart={onStart} />}
        </div>

        <div className="text-center text-white/70 text-sm">
          Pro tip: Press P to pause/resume. Survive longer to increase level and score faster.
        </div>
      </div>
    </div>
  );
}

export default App;
