import { useEffect, useRef } from 'react';

export default function LiveBackground({ theme }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── Colour scheme ────────────────────────────────────────────────────────
    const isDark = theme === 'dark';

    // Aurora bands colour stops (RGBA arrays)
    const AURORA_BANDS = isDark
      ? [
          { color: 'rgba(16,185,129,', alpha: 0.045 },
          { color: 'rgba(6,182,212,',  alpha: 0.030 },
          { color: 'rgba(52,211,153,', alpha: 0.040 },
          { color: 'rgba(20,184,166,', alpha: 0.025 },
        ]
      : [
          { color: 'rgba(16,185,129,', alpha: 0.06 },
          { color: 'rgba(167,243,208,',alpha: 0.08 },
          { color: 'rgba(52,211,153,', alpha: 0.05 },
          { color: 'rgba(110,179,136,',alpha: 0.04 },
        ];

    const BG_TOP    = isDark ? '#04100a' : '#f0faf4';
    const BG_BOTTOM = isDark ? '#060f0a' : '#e8f5ee';

    // ─── Particle pool ────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(canvas, isDark, true));

    function createParticle(canvas, isDark, randomY = false) {
      const size = Math.random() * 3.5 + 1;
      const alpha = Math.random() * 0.55 + 0.15;
      const isLeaf = Math.random() < 0.3;
      const greenShades = isDark
        ? ['rgba(16,185,129,', 'rgba(52,211,153,', 'rgba(110,179,136,', 'rgba(167,243,208,']
        : ['rgba(16,185,129,', 'rgba(5,150,105,',  'rgba(52,211,153,', 'rgba(110,179,136,'];
      const color = greenShades[Math.floor(Math.random() * greenShades.length)];
      return {
        x: Math.random() * canvas.width,
        y: randomY ? Math.random() * canvas.height : canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.4 + 0.12),
        size,
        alpha,
        color,
        isLeaf,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.012,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.018 + 0.006,
        wobbleAmp: Math.random() * 0.7 + 0.3,
        life: 1,
        decay: Math.random() * 0.0008 + 0.0002,
      };
    }

    // ─── Aurora bands state ───────────────────────────────────────────────────
    const auroraState = AURORA_BANDS.map((band, i) => ({
      ...band,
      phase: (i / AURORA_BANDS.length) * Math.PI * 2,
      phaseSpeed: 0.0005 + i * 0.0002,
      yBase: 0.25 + i * 0.15,   // fraction of canvas height
      amplitude: 0.08 + i * 0.02,
      waveFreq: 0.5 + i * 0.3,
      thickness: 0.20 + i * 0.05,
    }));

    // ─── Grid dots (subtle) ───────────────────────────────────────────────────
    const DOT_SPACING = 48;
    const DOT_ALPHA   = isDark ? 0.07 : 0.09;
    const DOT_COLOR   = isDark ? '110,179,136' : '16,185,129';

    // ─── Draw utilities ───────────────────────────────────────────────────────
    function drawBackground() {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, BG_TOP);
      grad.addColorStop(1, BG_BOTTOM);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawGrid() {
      ctx.fillStyle = `rgba(${DOT_COLOR},${DOT_ALPHA})`;
      for (let x = DOT_SPACING; x < canvas.width; x += DOT_SPACING) {
        for (let y = DOT_SPACING; y < canvas.height; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawAurora() {
      auroraState.forEach(band => {
        band.phase += band.phaseSpeed;

        const yCenter = canvas.height * band.yBase +
          Math.sin(band.phase * 0.7) * canvas.height * band.amplitude;
        const halfThick = canvas.height * band.thickness * 0.5;

        const grad = ctx.createLinearGradient(0, yCenter - halfThick, 0, yCenter + halfThick);
        grad.addColorStop(0,   band.color + '0)');
        grad.addColorStop(0.35, band.color + band.alpha + ')');
        grad.addColorStop(0.65, band.color + band.alpha + ')');
        grad.addColorStop(1,   band.color + '0)');

        ctx.save();
        ctx.beginPath();

        // Wavy top edge
        ctx.moveTo(0, yCenter - halfThick);
        for (let x = 0; x <= canvas.width; x += 6) {
          const wave = Math.sin(x * 0.005 * band.waveFreq + band.phase) * 30 +
                       Math.sin(x * 0.009 * band.waveFreq + band.phase * 1.4) * 15;
          ctx.lineTo(x, yCenter - halfThick + wave);
        }
        // Wavy bottom edge (reversed)
        for (let x = canvas.width; x >= 0; x -= 6) {
          const wave = Math.sin(x * 0.005 * band.waveFreq + band.phase + 1) * 30 +
                       Math.sin(x * 0.009 * band.waveFreq + band.phase * 1.4 + 0.5) * 15;
          ctx.lineTo(x, yCenter + halfThick + wave);
        }
        ctx.closePath();

        ctx.fillStyle = grad;
        ctx.filter = 'blur(18px)';
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
      });
    }

    function drawLeaf(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha * p.life;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size * 2, -p.size, p.size * 3, p.size, 0, p.size * 2.5);
      ctx.bezierCurveTo(-p.size * 3, p.size, -p.size * 2, -p.size, 0, 0);
      ctx.fillStyle = p.color + p.alpha * p.life + ')';
      ctx.fill();

      // Midrib
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, p.size * 2.5);
      ctx.strokeStyle = p.color + (p.alpha * p.life * 0.4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      ctx.restore();
    }

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha * p.life + ')';
      ctx.fill();
      ctx.restore();
    }

    // ─── Main loop ────────────────────────────────────────────────────────────
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
      drawGrid();
      drawAurora();

      particles.forEach((p, i) => {
        // Wobble horizontal drift
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp;
        p.y += p.vy;
        p.angle += p.angleSpeed;
        p.life -= p.decay;

        // Respawn at bottom when dead or out of bounds
        if (p.life <= 0 || p.y < -20 || p.x < -40 || p.x > canvas.width + 40) {
          particles[i] = createParticle(canvas, isDark, false);
          return;
        }

        if (p.isLeaf) drawLeaf(p);
        else drawParticle(p);
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}
