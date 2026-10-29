import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const TerminalCosmicBackground: React.FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

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

    // Initialize 240 Floating Cosmic Dust Particles
    const colors = ['#AC58E9', '#FFFFFF', '#c084fc', '#7928ca', '#ffffff', '#e9d5ff'];
    const particles: Particle[] = [];
    for (let i = 0; i < 240; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.45 + 0.1),
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Mouse inertia tracking
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      const normMouseX = (mouseX / width - 0.5) * 2;
      const normMouseY = (mouseY / height - 0.5) * 2;

      // Deep space cosmic base
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#000000');
      bgGrad.addColorStop(0.5, '#05010a');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1: Ambient Cosmic Nebula Clouds (Gently breathing) ---
      const nebX1 = width * 0.25 + Math.sin(time * 0.3) * 80 + normMouseX * 40;
      const nebY1 = height * 0.35 + Math.cos(time * 0.25) * 60 + normMouseY * 30;
      const neb1 = ctx.createRadialGradient(nebX1, nebY1, 20, nebX1, nebY1, width * 0.5);
      neb1.addColorStop(0, 'rgba(172, 88, 233, 0.10)');
      neb1.addColorStop(0.5, 'rgba(121, 40, 202, 0.04)');
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      const nebX2 = width * 0.75 + Math.cos(time * 0.35) * 70 - normMouseX * 30;
      const nebY2 = height * 0.65 + Math.sin(time * 0.2) * 50 - normMouseY * 20;
      const neb2 = ctx.createRadialGradient(nebX2, nebY2, 30, nebX2, nebY2, width * 0.45);
      neb2.addColorStop(0, 'rgba(172, 88, 233, 0.08)');
      neb2.addColorStop(0.5, 'rgba(121, 40, 202, 0.03)');
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: Blue Motion Undulating Fluid Waves (Pinterest Ref 2) ---
      const numWaves = 3;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const baseSpeed = 0.6 + w * 0.25;
        const waveY = height * (0.35 + w * 0.22);
        const waveAmp = 42 + w * 18;
        const waveFreq = 0.0022 - w * 0.0004;

        ctx.moveTo(0, waveY);
        for (let x = 0; x <= width; x += 18) {
          // Hydrodynamic cursor disturbance
          const distToMouse = Math.hypot(x - mouseX, waveY - mouseY);
          const mouseDeflect = Math.max(0, 1 - distToMouse / 280) * 35;

          const y =
            waveY +
            Math.sin(x * waveFreq + time * baseSpeed + w) * waveAmp +
            Math.cos(x * 0.004 - time * 0.4) * (waveAmp * 0.4) +
            (mouseY > waveY ? -mouseDeflect : mouseDeflect);

          ctx.lineTo(x, y);
        }

        ctx.lineWidth = 1.6 + (w === 1 ? 1 : 0);
        const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
        if (w === 0) {
          waveGrad.addColorStop(0, 'rgba(172, 88, 233, 0.05)');
          waveGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.28)');
          waveGrad.addColorStop(0.7, 'rgba(172, 88, 233, 0.35)');
          waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        } else if (w === 1) {
          waveGrad.addColorStop(0, 'rgba(172, 88, 233, 0.05)');
          waveGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
          waveGrad.addColorStop(0.8, 'rgba(172, 88, 233, 0.3)');
          waveGrad.addColorStop(1, 'rgba(172, 88, 233, 0.05)');
        } else {
          waveGrad.addColorStop(0, 'rgba(172, 88, 233, 0.02)');
          waveGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.25)');
          waveGrad.addColorStop(1, 'rgba(172, 88, 233, 0.02)');
        }

        ctx.strokeStyle = waveGrad;
        ctx.stroke();
      }

      // --- LAYER 3: Interactive Drifting Particles & Stars ---
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Particle velocity + gentle upward drift
        p.x += p.vx + normMouseX * 0.4;
        p.y += p.vy + normMouseY * 0.3;

        // Wrap around viewport edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse alpha
        const pulse = 0.7 + 0.3 * Math.sin(time * 2 + i);
        const curAlpha = p.alpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = curAlpha;
        ctx.fill();

        // Subtle glow halo for larger stars
        if (p.size > 2.0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = curAlpha * 0.25;
          ctx.fill();
        }
      }
      ctx.restore();

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
      className={`terminal-cosmic-bg ${className || ''}`}
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
