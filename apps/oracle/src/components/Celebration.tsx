import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas confetti burst — fires once on mount.
 * No external dependencies. Auto-cleans after 2.5s.
 */
export default function Celebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    // Capture narrowed ctx for use in draw closure
    const c: CanvasRenderingContext2D = ctx;
    c.scale(dpr, dpr);

    const colors = ['#d4a04a', '#7a9ca8', '#8b5a4a', '#6b7a5c', '#e8c86a', '#a8c8b0', '#c49a6c'];

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotSpeed: number;
      life: number; maxLife: number;
    }

    const particles: Particle[] = [];
    const boxW = canvas.offsetWidth;
    const boxH = canvas.offsetHeight;

    // Spawn from top-center area
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: boxW * (0.3 + Math.random() * 0.4),
        y: boxH * (0.15 + Math.random() * 0.15),
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 6 + 2,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.6,
      });
    }

    let raf: number;
    const start = performance.now();
    const duration = 2500;

    function draw(now: number) {
      const elapsed = now - start;
      if (elapsed > duration) {
        c.clearRect(0, 0, boxW, boxH);
        return;
      }

      c.clearRect(0, 0, boxW, boxH);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.15; // gravity
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life = Math.max(0, 1 - elapsed / (p.maxLife * 2500));

        c.save();
        c.translate(p.x, p.y);
        c.rotate((p.rotation * Math.PI) / 180);
        c.globalAlpha = p.life;
        c.fillStyle = p.color;
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
