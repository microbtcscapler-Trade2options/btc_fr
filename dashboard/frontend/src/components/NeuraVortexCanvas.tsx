import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  intensity?: number;
}

interface VortexParticle {
  arm: number;
  progress: number;
  speed: number;
  baseSize: number;
  color: string;
  coreColor: string;
  alpha: number;
  tangentOffset: number;
  isCoreSpark: boolean;
  orbitZ: number;
}

interface RibbonParticle {
  progress: number;
  ribbonIndex: number;
  size: number;
  speed: number;
  color: string;
  alpha: number;
}

export const NeuraVortexCanvas: React.FC<Props> = ({ className, intensity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // High-DPI / Retina crystal clarity
    const setupDPR = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    setupDPR();

    // Mouse parallax (instant snappy response)
    let mouseX = width / 2;
    let mouseY = height * 0.44;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    // Scroll synchronization tracking (0ms latency, direct coupling)
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let smoothedVelocity = 0;
    let scrollInertiaAngle = 0;

    const handleResize = () => {
      setupDPR();
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Crisp Deep Space Starfield (160 sharp pinpoint stars in White and Vibe Purple)
    const starCount = 160;
    const stars: { x: number; y: number; size: number; alpha: number; twinkleSpeed: number; color: string }[] = [];
    const starColors = ['#ffffff', '#ac58e9', '#c882f5', '#e0b4fa', '#ffffff', '#ac58e9'];
    for (let i = 0; i < starCount; i++) {
      const a = Math.random() * 0.5 + 0.25;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.4 + 0.5,
        alpha: a,
        twinkleSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // 2. High-Density Swirling Vortex in Strict Vibe Purple (#ac58e9) and White
    const particleCount = 550;
    const particles: VortexParticle[] = [];
    const vortexColors = [
      { col: '#ac58e9', core: '#ffffff' }, // Vibe Purple
      { col: '#c882f5', core: '#ffffff' }, // Electric Violet
      { col: '#e0b4fa', core: '#ffffff' }, // Radiant Lilac
      { col: '#9333ea', core: '#ffffff' }, // Deep Violet
      { col: '#ffffff', core: '#ac58e9' }  // Pure White
    ];

    const numArms = 4;
    for (let i = 0; i < particleCount; i++) {
      const palette = vortexColors[i % vortexColors.length];
      const isSpark = Math.random() < 0.22;
      particles.push({
        arm: i % numArms,
        progress: Math.random(),
        speed: (0.0016 + Math.random() * 0.0026) * intensity,
        baseSize: isSpark ? Math.random() * 2.2 + 1.8 : Math.random() * 1.4 + 0.8,
        color: palette.col,
        coreColor: palette.core,
        alpha: Math.random() * 0.45 + 0.35,
        tangentOffset: (Math.random() - 0.5) * 18,
        isCoreSpark: isSpark,
        orbitZ: (Math.random() - 0.5) * 60
      });
    }

    // 3. Braided Fluid Energy Ribbon Particles (White and Vibe Purple #ac58e9)
    const ribbonParticleCount = 90;
    const ribbonParticles: RibbonParticle[] = [];
    for (let i = 0; i < ribbonParticleCount; i++) {
      ribbonParticles.push({
        progress: Math.random(),
        ribbonIndex: i % 3,
        size: Math.random() * 2.0 + 1.0,
        speed: 0.002 + Math.random() * 0.0025,
        color: i % 2 === 0 ? '#ac58e9' : '#ffffff',
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;

      // 1. Direct instantaneous scroll sampling (0ms latency)
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Kinetic scroll impulse
      scrollVelocity += scrollDelta * 0.05;
      smoothedVelocity += (scrollVelocity - smoothedVelocity) * 0.35;
      scrollVelocity *= 0.82;
      scrollInertiaAngle += smoothedVelocity * 0.004;

      // Snappy mouse tracking (0.16 easing)
      mouseX += (targetMouseX - mouseX) * 0.16;
      mouseY += (targetMouseY - mouseY) * 0.16;

      // Document scroll progression
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollRatio = Math.min(1, Math.max(0, currentScrollY / maxScroll));

      // Direct scroll-driven angle and camera depth
      const scrollDirectAngle = currentScrollY * 0.0032;
      const totalRotation = (time * 0.24) + scrollDirectAngle + scrollInertiaAngle;

      // Zoom camera into vortex as user scrolls down the page
      const vortexZoom = 1.0 + Math.pow(scrollRatio, 0.85) * 0.65;

      // Center shifts gracefully with scroll depth
      const centerX = width / 2 + (mouseX - width / 2) * 0.05;
      const centerY = (height * 0.44) + (mouseY - height * 0.44) * 0.05 - (currentScrollY * 0.08);

      // Fast scroll warp indicator
      const isFastScrolling = Math.abs(smoothedVelocity) > 0.6;
      const warpLength = Math.min(18, Math.abs(smoothedVelocity) * 1.8);

      // --- CLEAR CANVAS ---
      ctx.clearRect(0, 0, width, height);

      // --- 1. Cosmic Ambient Core Nebula Glow ---
      const corePulse = Math.sin(time * 2.2) * 0.05 + 1.0;
      const velocityFlare = Math.min(1.0, Math.abs(smoothedVelocity) * 0.06);

      const cosmicGlow = ctx.createRadialGradient(
        centerX, centerY, 15,
        centerX, centerY, Math.min(width, height) * 0.72 * vortexZoom
      );
      cosmicGlow.addColorStop(0, `rgba(172, 88, 233, ${0.25 * corePulse + velocityFlare * 0.15})`);
      cosmicGlow.addColorStop(0.32, `rgba(121, 40, 202, ${0.14 + velocityFlare * 0.1})`);
      cosmicGlow.addColorStop(0.65, 'rgba(88, 28, 135, 0.05)');
      cosmicGlow.addColorStop(0.9, 'rgba(0, 0, 0, 0.35)');
      cosmicGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cosmicGlow;
      ctx.fillRect(0, 0, width, height);

      // --- 2. High-Definition Starfield ---
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.85) {
          star.alpha = 0.85;
          star.twinkleSpeed = -Math.abs(star.twinkleSpeed);
        } else if (star.alpha < 0.2) {
          star.alpha = 0.2;
          star.twinkleSpeed = Math.abs(star.twinkleSpeed);
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // --- 3. Logarithmic Vortex Spiral Energy Stream Filaments in Vibe Purple (#ac58e9) ---
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const maxRadius = Math.max(width, height) * 0.44 * vortexZoom;
      for (let arm = 0; arm < numArms; arm++) {
        const armBaseAngle = arm * ((Math.PI * 2) / numArms);
        const streamSegments = 50;

        ctx.beginPath();
        for (let s = 0; s <= streamSegments; s++) {
          const p = s / streamSegments;
          const theta = armBaseAngle + p * (Math.PI * 3.2) + totalRotation;
          // Eased radius so center stays clear and open
          const r = Math.pow(p, 0.8) * maxRadius + 30;
          const sx = centerX + Math.cos(theta) * r;
          const sy = centerY + Math.sin(theta) * r;

          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }

        const armColors = ['#ac58e9', '#c882f5', '#e0b4fa', '#7928ca'];
        ctx.strokeStyle = armColors[arm % armColors.length];
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.18 + velocityFlare * 0.1;
        ctx.stroke();
      }
      ctx.restore();

      // --- 4. Central Soft Singularity Glow in Vibe Purple & White ---
      ctx.save();
      const singularityRadius = 32 * corePulse + velocityFlare * 10;
      const singularityGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, singularityRadius
      );
      singularityGlow.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      singularityGlow.addColorStop(0.35, 'rgba(172, 88, 233, 0.45)');
      singularityGlow.addColorStop(0.7, 'rgba(88, 28, 135, 0.25)');
      singularityGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = singularityGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, singularityRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dual subtle 3D orbital rings in Vibe Purple and White
      for (let ring = 0; ring < 2; ring++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1.0, 0.38);
        const ringAngle = (time * (ring === 0 ? 0.5 : -0.4)) + (currentScrollY * 0.002 * (ring === 0 ? 1 : -1));
        ctx.rotate(ringAngle);

        const rRadius = (ring === 0 ? 68 : 98) * vortexZoom;
        ctx.strokeStyle = ring === 0 ? 'rgba(172, 88, 233, 0.45)' : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting electron beads
        const beadAngle = time * (ring === 0 ? 1.8 : -1.4) + (currentScrollY * 0.004);
        const beadX = Math.cos(beadAngle) * rRadius;
        const beadY = Math.sin(beadAngle) * rRadius;
        ctx.beginPath();
        ctx.arc(beadX, beadY, ring === 0 ? 2.8 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = ring === 0 ? '#ac58e9' : '#ffffff';
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // --- 5. Braided Fluid Energy Ribbons in Vibe Purple & White ---
      const ribbonScrollPhase = currentScrollY * 0.0035;
      const baseRibbonY = Math.max(height * 0.45, 340);
      const ribbons = [
        { colorStart: 'rgba(172, 88, 233, 0)', colorMid: 'rgba(172, 88, 233, 0.65)', colorEnd: 'rgba(172, 88, 233, 0)', yOffset: baseRibbonY, freq: 1.2, amp: 34 },
        { colorStart: 'rgba(255, 255, 255, 0)', colorMid: 'rgba(255, 255, 255, 0.45)', colorEnd: 'rgba(255, 255, 255, 0)', yOffset: baseRibbonY + 32, freq: 1.5, amp: 28 },
        { colorStart: 'rgba(121, 40, 202, 0)', colorMid: 'rgba(200, 130, 245, 0.55)', colorEnd: 'rgba(121, 40, 202, 0)', yOffset: baseRibbonY + 62, freq: 1.0, amp: 22 }
      ];

      for (let r = 0; r < ribbons.length; r++) {
        const rb = ribbons[r];
        ctx.save();
        ctx.beginPath();
        const waveSegments = 45;
        const dynamicAmp = rb.amp + Math.abs(smoothedVelocity) * 1.5;

        for (let k = 0; k <= waveSegments; k++) {
          const wx = (k / waveSegments) * width;
          const wy = centerY + rb.yOffset + Math.sin(time * rb.freq + k * 0.22 + ribbonScrollPhase + r) * dynamicAmp;
          if (k === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }

        const ribbonGrad = ctx.createLinearGradient(0, centerY + rb.yOffset, width, centerY + rb.yOffset);
        ribbonGrad.addColorStop(0, rb.colorStart);
        ribbonGrad.addColorStop(0.3, rb.colorMid);
        ribbonGrad.addColorStop(0.7, rb.colorMid);
        ribbonGrad.addColorStop(1, rb.colorEnd);

        ctx.strokeStyle = ribbonGrad;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }

      // Ribbon Particles (Luminous stardust dancing along the ribbon streams)
      for (let rp = 0; rp < ribbonParticles.length; rp++) {
        const p = ribbonParticles[rp];
        p.progress = (p.progress + p.speed + Math.abs(smoothedVelocity) * 0.002) % 1;

        const rb = ribbons[p.ribbonIndex];
        const px = p.progress * width;
        const py = centerY + rb.yOffset + Math.sin(time * rb.freq + (p.progress * 45) * 0.22 + ribbonScrollPhase + p.ribbonIndex) * rb.amp;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * Math.sin(p.progress * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // --- 6. Swirling Vortex Particles (Scroll Synchronized with Warp) ---
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const speedMultiplier = 1.0 + Math.abs(smoothedVelocity) * 0.16;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.progress = (p.progress + p.speed * speedMultiplier) % 1;

        const armAngle = p.arm * ((Math.PI * 2) / numArms);
        const theta = armAngle + p.progress * (Math.PI * 3.2) + totalRotation;
        // Radial expansion keeping the center clear and readable
        const radius = (Math.pow(p.progress, 0.78) * 360 + 35) * vortexZoom;

        // Position coordinates
        const x = centerX + Math.cos(theta) * radius + Math.cos(theta + Math.PI / 2) * p.tangentOffset;
        const y = centerY + Math.sin(theta) * radius + Math.sin(theta + Math.PI / 2) * p.tangentOffset + p.orbitZ;

        // Soft fade near center and edges
        const distFromCenter = Math.hypot(x - centerX, y - centerY);
        const centerClearance = Math.min(1.0, distFromCenter / 90);
        const fadeAlpha = p.alpha * Math.sin(p.progress * Math.PI) * centerClearance * (0.5 + 0.5 * (1 - Math.min(1, distFromCenter / (440 * vortexZoom))));
        const renderSize = p.baseSize * (0.7 + 0.5 * (1 - p.progress));

        if (isFastScrolling) {
          // Instantaneous warp streaks during scroll
          const tangentX = -Math.sin(theta) * warpLength;
          const tangentY = Math.cos(theta) * warpLength;

          ctx.beginPath();
          ctx.moveTo(x - tangentX, y - tangentY);
          ctx.lineTo(x + tangentX, y + tangentY);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = renderSize;
          ctx.globalAlpha = Math.min(1.0, fadeAlpha * 1.3);
          ctx.stroke();
        } else {
          // Clean neon particle
          ctx.beginPath();
          ctx.arc(x, y, renderSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = fadeAlpha;
          ctx.fill();

          // Diamond white core spark
          if (p.isCoreSpark && renderSize > 1.6) {
            ctx.beginPath();
            ctx.arc(x, y, renderSize * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = p.coreColor;
            ctx.globalAlpha = Math.min(1.0, fadeAlpha * 1.5);
            ctx.fill();
          }
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [intensity]);

  return (
    <div
      className={`neura-vortex-container ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};
