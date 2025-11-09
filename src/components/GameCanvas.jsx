import React, { useEffect, useRef } from 'react';

// Simple bullet-hell style engine using canvas
// Player is a spaceship at bottom that can move and shoot
// Meteors fall from top; enemy ships shoot radial bullets like Touhou

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function GameCanvas({ onScore, onLifeLost, playing, onGameOver, level }) {
  const canvasRef = useRef(null);
  const animRef = useRef(0);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const handleResize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const input = { left: false, right: false, up: false, down: false, shoot: false };

    const keyMap = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
      a: 'left',
      d: 'right',
      w: 'up',
      s: 'down',
      ' ': 'shoot',
    };

    const keyDown = (e) => {
      const k = keyMap[e.key];
      if (k) {
        e.preventDefault();
        input[k] = true;
      }
    };
    const keyUp = (e) => {
      const k = keyMap[e.key];
      if (k) {
        e.preventDefault();
        input[k] = false;
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const player = {
      x: width / 2,
      y: height - 80,
      r: 12,
      speed: 4,
      cooldown: 0,
      invuln: 0,
    };

    const bullets = [];
    const enemyBullets = [];
    const meteors = [];
    const enemies = [];

    let score = 0;
    let lives = 3;
    let tick = 0;

    function spawnMeteor() {
      const r = rand(12, 28);
      meteors.push({ x: rand(r, width - r), y: -r, r, vy: rand(2, 4) + level * 0.4, hp: Math.ceil(r / 8) });
    }

    function spawnEnemy() {
      const x = rand(40, width - 40);
      enemies.push({ x, y: -30, r: 16, vy: 1.2 + level * 0.2, fireRate: 60 - Math.min(45, level * 3), t: 0, hp: 4 + level });
    }

    function shoot() {
      bullets.push({ x: player.x - 6, y: player.y - 12, vx: 0, vy: -8, r: 3 });
      bullets.push({ x: player.x + 6, y: player.y - 12, vx: 0, vy: -8, r: 3 });
    }

    function enemyShoot(e) {
      const patterns = [
        // radial burst
        () => {
          const n = 12;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, r: 3, c: '#38bdf8' });
          }
        },
        // aimed spread
        () => {
          const angle = Math.atan2(player.y - e.y, player.x - e.x);
          [ -0.25, 0, 0.25 ].forEach((off) => {
            const a = angle + off;
            enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, r: 3, c: '#f97316' });
          });
        }
      ];
      const pick = patterns[Math.floor(rand(0, patterns.length))];
      pick();
    }

    function circleCollide(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const r = a.r + b.r;
      return dx * dx + dy * dy < r * r;
    }

    function step() {
      animRef.current = requestAnimationFrame(step);
      if (!playing) return; // pause render but preserve state
      tick++;

      // Clear
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Background stars parallax
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97 + tick * 0.4) % width;
        const sy = (i * 53 + tick * (0.3 + (i % 3) * 0.2)) % height;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Player movement
      const speed = player.speed;
      if (input.left) player.x -= speed;
      if (input.right) player.x += speed;
      if (input.up) player.y -= speed;
      if (input.down) player.y += speed;
      player.x = Math.max(player.r, Math.min(width - player.r, player.x));
      player.y = Math.max(player.r, Math.min(height - player.r, player.y));

      // Shooting
      if (player.cooldown > 0) player.cooldown--;
      if (input.shoot && player.cooldown <= 0) {
        shoot();
        player.cooldown = 8;
      }

      // Spawns
      if (tick % Math.max(16, 36 - level * 2) === 0) spawnMeteor();
      if (tick % Math.max(60, 160 - level * 10) === 0) spawnEnemy();

      // Update meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.y += m.vy;
        // rotate visual hint
        if (m.y - m.r > height) meteors.splice(i, 1);
      }

      // Update enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.vy;
        e.t++;
        if (e.t % Math.max(24, e.fireRate) === 0) enemyShoot(e);
        if (e.y - e.r > height || e.hp <= 0) enemies.splice(i, 1);
      }

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.vy;
        if (b.y < -20) bullets.splice(i, 1);
      }

      // Update enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -20 || b.x > width + 20 || b.y < -20 || b.y > height + 20) enemyBullets.splice(i, 1);
      }

      // Collisions: bullets vs meteors/enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        let hit = false;
        const b = bullets[i];
        for (let j = meteors.length - 1; j >= 0; j--) {
          const m = meteors[j];
          if (circleCollide({ x: b.x, y: b.y, r: b.r }, m)) {
            m.hp -= 1;
            hit = true;
            if (m.hp <= 0) {
              score += Math.round(10 + m.r);
              onScore(score);
              meteors.splice(j, 1);
            }
            break;
          }
        }
        if (!hit) {
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (circleCollide({ x: b.x, y: b.y, r: b.r }, e)) {
              e.hp -= 1;
              hit = true;
              if (e.hp <= 0) {
                score += 50 + level * 10;
                onScore(score);
              }
              break;
            }
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      // Collisions: player vs meteors/enemyBullets
      if (player.invuln > 0) player.invuln--;
      const pHitbox = { x: player.x, y: player.y, r: 8 };
      if (player.invuln <= 0) {
        for (let i = meteors.length - 1; i >= 0; i--) {
          if (circleCollide(pHitbox, meteors[i])) {
            lives -= 1;
            onLifeLost(lives);
            player.invuln = 120;
            if (lives <= 0) {
              onGameOver(score);
              cancelAnimationFrame(animRef.current);
              return;
            }
            break;
          }
        }
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
          if (circleCollide(pHitbox, enemyBullets[i])) {
            enemyBullets.splice(i, 1);
            lives -= 1;
            onLifeLost(lives);
            player.invuln = 120;
            if (lives <= 0) {
              onGameOver(score);
              cancelAnimationFrame(animRef.current);
              return;
            }
            break;
          }
        }
      }

      // Draw meteors
      meteors.forEach((m) => {
        const g = ctx.createRadialGradient(m.x - m.r * 0.3, m.y - m.r * 0.3, 2, m.x, m.y, m.r);
        g.addColorStop(0, '#fde68a');
        g.addColorStop(1, '#b45309');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();
      });

      // Draw enemies (spaceships)
      enemies.forEach((e) => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(12, 10);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Draw enemy bullets
      enemyBullets.forEach((b) => {
        ctx.fillStyle = b.c || '#a78bfa';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player ship
      ctx.save();
      ctx.translate(player.x, player.y);
      if (player.invuln > 0 && Math.floor(player.invuln / 8) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(12, 12);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw player bullets
      ctx.fillStyle = '#34d399';
      bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Level up over time
      if (tick % 900 === 0) {
        // every 15 seconds
        // eslint-disable-next-line no-param-reassign
        // level handled by parent; we just signal via score bump
        score += 0;
      }
    }

    stateRef.current = { input };
    animRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [playing, level, onScore, onLifeLost, onGameOver]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full bg-slate-950 rounded-lg border border-white/10" />
      {!playing && (
        <div className="absolute inset-0 grid place-items-center bg-slate-900/40 backdrop-blur-sm">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Paused</h2>
            <p className="text-white/70">Press Space to shoot. Arrow or WASD to move.</p>
          </div>
        </div>
      )}
    </div>
  );
}
