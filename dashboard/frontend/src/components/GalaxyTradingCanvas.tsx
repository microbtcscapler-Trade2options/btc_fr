import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  origZ: number;
  size: number;
  alpha: number;
  color: string;
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const GalaxyTradingCanvas: React.FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for subtle parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Initialize 3D Starfield & Galaxy Dust
    const numStars = 320;
    const stars: Star[] = [];
    const starColors = ['#AC58E9', '#c084fc', '#FFFFFF', '#AC58E9', '#FFFFFF', '#e9d5ff', '#581c87'];
    for (let i = 0; i < numStars; i++) {
      const z = Math.random() * 1500 + 80;
      stars.push({
        x: (Math.random() - 0.5) * 2600,
        y: (Math.random() - 0.5) * 2000,
        z: z,
        origZ: z,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // 2. Floating Cosmic Stardust & Energy Particles
    const numDust = 40;
    const dustParticles: Stardust[] = [];
    for (let i = 0; i < numDust; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.15),
        size: Math.random() * 3 + 1.2,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() > 0.5 ? '#c084fc' : '#FFFFFF'
      });
    }

    let time = 0;

    // Render Loop (Pure, seamless cosmic purple starfield & nebula)
    const render = () => {
      time += 0.012;

      // Smooth mouse easing for parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const mouseNormX = (mouseX / width - 0.5) * 2;
      const mouseNormY = (mouseY / height - 0.5) * 2;

      // Base: Deep space cosmic midnight violet
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030804');
      bgGrad.addColorStop(0.5, '#061207');
      bgGrad.addColorStop(1, '#030804');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1: Ambient Purple Nebula Clouds (Soft, non-overlapping) ---
      ctx.save();
      const nebula1X = width * 0.3 + Math.sin(time * 0.3) * 60;
      const nebula1Y = height * 0.35 + Math.cos(time * 0.25) * 40;
      const nebula1 = ctx.createRadialGradient(nebula1X, nebula1Y, 50, nebula1X, nebula1Y, width * 0.45);
      nebula1.addColorStop(0, 'rgba(172, 88, 233,  0.09)');
      nebula1.addColorStop(0.5, 'rgba(121, 40, 202,  0.04)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2X = width * 0.7 + Math.cos(time * 0.35) * 50;
      const nebula2Y = height * 0.65 + Math.sin(time * 0.3) * 40;
      const nebula2 = ctx.createRadialGradient(nebula2X, nebula2Y, 60, nebula2X, nebula2Y, width * 0.45);
      nebula2.addColorStop(0, 'rgba(172, 88, 233,  0.07)');
      nebula2.addColorStop(0.5, 'rgba(172, 88, 233,  0.03)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1.5: Subtle Holographic Radar HUD Rings in Background ---
      const radarCenterX = width / 2;
      const radarCenterY = height / 2;
      ctx.save();
      ctx.translate(radarCenterX, radarCenterY);

      // Outer faint cosmic violet coordinate ring
      ctx.strokeStyle = 'rgba(192, 132, 252,  0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      // Middle rotating dashed ring
      ctx.save();
      ctx.rotate(time * 0.04);
      ctx.strokeStyle = 'rgba(172, 88, 233,  0.11)';
      ctx.setLineDash([8, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner subtle coordinate crosshair ticks
      ctx.strokeStyle = 'rgba(192, 132, 252,  0.1)';
      ctx.setLineDash([]);
      const ringR = Math.min(width, height) * 0.28;
      ctx.beginPath();
      ctx.moveTo(0, -ringR - 12); ctx.lineTo(0, -ringR + 12);
      ctx.moveTo(0, ringR - 12); ctx.lineTo(0, ringR + 12);
      ctx.moveTo(-ringR - 12, 0); ctx.lineTo(-ringR + 12, 0);
      ctx.moveTo(ringR - 12, 0); ctx.lineTo(ringR + 12, 0);
      ctx.stroke();

      ctx.restore();
      ctx.restore();

      // --- LAYER 2: 3D Stars with Perspective Motion & Parallax ---
      const fov = 440;
      const cx = width / 2 + mouseNormX * -35;
      const cy = height / 2 + mouseNormY * -25;
      const visibleStars: { x: number; y: number; z: number; color: string }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= 0.55; // gentle drift toward viewer
        if (s.z <= 10) {
          s.z = 1500;
          s.x = (Math.random() - 0.5) * 2600;
          s.y = (Math.random() - 0.5) * 2000;
        }

        const scale = fov / s.z;
        const px = cx + s.x * scale;
        const py = cy + s.y * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0.12, (1 - s.z / 1500) * s.alpha));
          const pSize = Math.max(0.7, s.size * scale);

          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = depthAlpha;
          ctx.fill();

          if (s.z < 400) {
            visibleStars.push({ x: px, y: py, z: s.z, color: s.color });

            // Subtle twinkle halo for closer stars
            ctx.beginPath();
            ctx.arc(px, py, pSize * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(172, 88, 233,  0.12)';
            ctx.fill();
          }
        }
      }

      // Constellation Filaments: connect nearby close stars
      ctx.lineWidth = 0.75;
      for (let i = 0; i < visibleStars.length; i++) {
        for (let j = i + 1; j < visibleStars.length; j++) {
          const dx = visibleStars[i].x - visibleStars[j].x;
          const dy = visibleStars[i].y - visibleStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(visibleStars[i].x, visibleStars[i].y);
            ctx.lineTo(visibleStars[j].x, visibleStars[j].y);
            const lineAlpha = (1 - dist / 85) * 0.18;
            ctx.strokeStyle = `rgba(192, 132, 252,  ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Shooting Meteor Comets
      const meteorCycle = (time * 0.6) % 10;
      if (meteorCycle < 1.4) {
        const mProgress = meteorCycle / 1.4;
        const startX = width * 0.85 - mProgress * (width * 0.45);
        const startY = height * 0.05 + mProgress * (height * 0.35);
        const trailLen = 95;

        const cometGrad = ctx.createLinearGradient(
          startX,
          startY,
          startX + trailLen * 0.8,
          startY - trailLen * 0.5
        );
        cometGrad.addColorStop(0, '#FFFFFF');
        cometGrad.addColorStop(0.3, 'rgba(172, 88, 233,  0.8)');
        cometGrad.addColorStop(0.7, 'rgba(172, 88, 233,  0.3)');
        cometGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + trailLen * 0.8, startY - trailLen * 0.5);
        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // --- LAYER 3: Ambient Floating Stardust / Energy Particles ---
      for (let d = 0; d < dustParticles.length; d++) {
        const dust = dustParticles[d];
        dust.x += dust.vx;
        dust.y += dust.vy;

        if (dust.y < -10) {
          dust.y = height + 10;
          dust.x = Math.random() * width;
        }
        if (dust.x < -10) dust.x = width + 10;
        if (dust.x > width + 10) dust.x = -10;

        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fillStyle = dust.color;
        ctx.globalAlpha = dust.alpha * (0.7 + Math.sin(time * 2.5 + d) * 0.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`galaxy-trading-canvas ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
