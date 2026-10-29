import React, { useEffect, useRef, useState } from 'react';

interface Props {
  price?: number;
  entropyPct?: number;
  regimeName?: string;
  confidence?: number;
  entropyScore?: number;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  baseRadius: number;
  color: string;
  size: number;
  pulsePhase: number;
}

export const CosmicParticleSphere3D: React.FC<Props> = ({
  price,
  entropyPct,
  regimeName = 'TREND_FLOW',
  confidence = 85,
  entropyScore = 9.42,
  className
}) => {
  const effectiveConfidence = entropyPct ?? confidence;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [coordsDisplay, setCoordsDisplay] = useState({ pitch: '14.2°', yaw: '42.8°' });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth || 360);
    let height = (canvas.height = container.clientHeight || 320);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth || 360;
      height = canvas.height = container.clientHeight || 320;
    };
    window.addEventListener('resize', handleResize);

    // 3D Rotation angles and velocities
    let pitch = 0.2;
    let yaw = 0.5;
    let targetPitch = 0.2;
    let targetYaw = 0.5;
    let isMouseInteracting = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetYaw = relX * Math.PI * 1.5;
      targetPitch = -relY * Math.PI * 1.2;
      isMouseInteracting = true;
    };

    const handleMouseLeave = () => {
      isMouseInteracting = false;
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);

    // Initialize 450 points on Fibonacci Sphere
    const N = 450;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const sphereRadius = Math.min(width, height) * 0.36;
    const points: Point3D[] = [];
    const colorPalette = ['#FFFFFF', '#FFFFFF', '#c084fc', '#AC58E9', '#AC58E9', '#AC58E9'];

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        origX: x * sphereRadius,
        origY: y * sphereRadius,
        origZ: z * sphereRadius,
        baseRadius: sphereRadius,
        color: colorPalette[i % colorPalette.length],
        size: Math.random() * 2.2 + 1.2,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth auto-rotation when user is not actively tilting
      if (!isMouseInteracting) {
        targetYaw += 0.006;
        targetPitch = Math.sin(time * 0.4) * 0.25;
      }

      pitch += (targetPitch - pitch) * 0.08;
      yaw += (targetYaw - yaw) * 0.08;

      // Update readout every 10 frames
      if (Math.floor(time * 60) % 12 === 0) {
        setCoordsDisplay({
          pitch: `${((pitch * 180) / Math.PI).toFixed(1)}°`,
          yaw: `${((yaw * 180) / Math.PI).toFixed(1)}°`
        });
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const cameraDist = 420;

      // 3D rotation trigonometric values
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Pre-calculate transformed coordinates & sort by depth (z)
      const projectedPoints: {
        x2d: number;
        y2d: number;
        z3d: number;
        size: number;
        alpha: number;
        color: string;
      }[] = [];

      // Audio-reactive wave pulsation factor
      const waveMod = 1 + 0.09 * Math.sin(time * 4) * Math.cos(time * 2.5);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Harmonic sphere surface ripple
        const ripple =
          1 +
          0.06 * Math.sin(p.origX * 0.04 + time * 3) +
          0.04 * Math.cos(p.origY * 0.04 + time * 2);

        const currentR = p.baseRadius * waveMod * ripple;
        const normFactor = currentR / p.baseRadius;

        const bx = p.origX * normFactor;
        const by = p.origY * normFactor;
        const bz = p.origZ * normFactor;

        // Yaw rotation around Y axis
        const x1 = bx * cosY + bz * sinY;
        const y1 = by;
        const z1 = -bx * sinY + bz * cosY;

        // Pitch rotation around X axis
        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP;

        // Perspective 3D projection
        const scale = cameraDist / (cameraDist + z2);
        const x2d = cx + x2 * scale;
        const y2d = cy + y2 * scale;

        // Depth-based transparency and size
        const depthNorm = (z2 + sphereRadius) / (sphereRadius * 2); // 0 (far) to 1 (near)
        const alpha = Math.max(0.12, Math.min(1, 0.2 + depthNorm * 0.8));
        const finalSize = Math.max(0.8, p.size * scale * (0.6 + depthNorm * 0.8));

        projectedPoints.push({
          x2d,
          y2d,
          z3d: z2,
          size: finalSize,
          alpha,
          color: p.color
        });
      }

      // Sort points from back to front for proper rendering depth
      projectedPoints.sort((a, b) => a.z3d - b.z3d);

      // Draw connecting filaments between proximal points on front hemisphere
      ctx.lineWidth = 0.7;
      for (let i = 0; i < projectedPoints.length; i += 3) {
        const p1 = projectedPoints[i];
        if (p1.z3d < -20) continue; // Skip back hemisphere filaments

        for (let j = i + 1; j < Math.min(projectedPoints.length, i + 8); j++) {
          const p2 = projectedPoints[j];
          if (p2.z3d < -20) continue;

          const dist = Math.hypot(p1.x2d - p2.x2d, p1.y2d - p2.y2d);
          if (dist < 32) {
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.strokeStyle = `rgba(172, 88, 233,  ${Math.max(0, (1 - dist / 32) * 0.22)})`;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < projectedPoints.length; i++) {
        const p = projectedPoints[i];

        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glowing corona for nearest high-depth nodes
        if (p.z3d > sphereRadius * 0.35) {
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, p.size * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.28;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`cosmic-particle-sphere-card ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(12, 32, 16,  0.75) 0%, rgba(6, 16, 8,  0.95) 100%)',
        border: '1px solid rgba(172, 88, 233,  0.35)',
        boxShadow: isHovered
          ? '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(172, 88, 233,  0.35)'
          : '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(172, 88, 233,  0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
        cursor: 'grab',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 22px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#AC58E9',
                boxShadow: '0 0 8px #AC58E9'
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#c084fc', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              GLOBAL REGIME ENTROPY SPHERE
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 1 })}` : regimeName.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Live Vector Coordinates */}
        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>TILT VECTOR</div>
          <div style={{ fontSize: 11, color: '#AC58E9', fontWeight: 800, marginTop: 2 }}>
            P:{coordsDisplay.pitch} Y:{coordsDisplay.yaw}
          </div>
        </div>
      </div>

      {/* Center 3D Interactive Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* Bottom Telemetry HUD */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          background: 'rgba(9, 4, 18, 0.72)',
          border: '1px solid rgba(172, 88, 233,  0.25)',
          borderRadius: '12px',
          padding: '8px 14px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: '#71717A', fontWeight: 700 }}>ENTROPY SCORE</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>
              {entropyScore.toFixed(2)}
            </div>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <div style={{ fontSize: 9, color: '#71717A', fontWeight: 700 }}>CONSENSUS GATE</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace" }}>
              {effectiveConfidence}% PASSED
            </div>
          </div>
        </div>

        <span style={{ fontSize: 10, color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>◈ 3D ROTATE ON CURSOR</span>
        </span>
      </div>
    </div>
  );
};
