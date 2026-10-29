import React, { useEffect, useRef, useState } from 'react';

interface Props {
  className?: string;
  generation?: number;
  activeGenesCount?: number;
  activePair?: string;
  healthScore?: number;
}

interface GeneRung {
  index: number;
  label: string;
  status: 'ACTIVE' | 'MUTATED' | 'LOCKED' | 'OPTIMIZED';
  score: string;
  t: number; // Parameter along helix
}

const GENE_DATA: { label: string; status: 'ACTIVE' | 'MUTATED' | 'LOCKED' | 'OPTIMIZED'; score: string }[] = [
  { label: 'EMA_FAN_20_50', status: 'OPTIMIZED', score: '9.8' },
  { label: 'ATR_FILTER_14', status: 'ACTIVE', score: '9.4' },
  { label: 'ORB_BREAKOUT', status: 'LOCKED', score: '9.1' },
  { label: 'MT5_DIRECT_IPC', status: 'ACTIVE', score: '9.9' },
  { label: 'DERIBIT_COLLAR', status: 'MUTATED', score: '8.8' },
  { label: 'CHOP_INDEX_60', status: 'OPTIMIZED', score: '9.5' },
  { label: 'MOMENTUM_SURGE', status: 'ACTIVE', score: '9.7' },
  { label: 'WALK_FORWARD_OOS', status: 'LOCKED', score: '9.6' }
];

export const GenomeDoubleHelix3D: React.FC<Props> = ({
  className,
  generation = 24,
  activeGenesCount = 48,
  activePair,
  healthScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiltStats, setTiltStats] = useState({ pitch: '12°', roll: '-18°' });

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

    // 3D Rotation State
    let angle = 0;
    let pitch = 0.25;
    let roll = -0.35;
    let targetPitch = 0.25;
    let targetRoll = -0.35;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      targetRoll = normX * Math.PI * 0.9;
      targetPitch = normY * Math.PI * 0.7;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Build the 8 Gene Rungs
    const rungs: GeneRung[] = GENE_DATA.map((g, i) => ({
      index: i,
      label: g.label,
      status: g.status,
      score: g.score,
      t: (i - 3.5) * 0.75
    }));

    let time = 0;

    const render = () => {
      time += 0.018;
      angle += 0.022; // Constant helical spin

      pitch += (targetPitch - pitch) * 0.06;
      roll += (targetRoll - roll) * 0.06;

      if (Math.floor(time * 60) % 15 === 0) {
        setTiltStats({
          pitch: `${((pitch * 180) / Math.PI).toFixed(0)}°`,
          roll: `${((roll * 180) / Math.PI).toFixed(0)}°`
        });
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const helixRadius = Math.min(width, height) * 0.28;
      const verticalSpacing = 28;
      const cameraDist = 480;

      // Diagonal helix orientation transformation matrices
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);

      const project3D = (x: number, y: number, z: number) => {
        // 1. Roll rotation around Z
        const x1 = x * cosR - y * sinR;
        const y1 = x * sinR + y * cosR;
        const z1 = z;

        // 2. Pitch rotation around X
        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP;

        // Perspective scale
        const scale = cameraDist / (cameraDist + z2);
        return {
          px: cx + x2 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale
        };
      };

      // Continuous points along the two backbone strands
      const strand1Points: { px: number; py: number; pz: number }[] = [];
      const strand2Points: { px: number; py: number; pz: number }[] = [];
      const steps = 70;

      for (let s = 0; s <= steps; s++) {
        const t = (s / steps - 0.5) * 6.5;
        const curAngle = t * 1.8 + angle;
        const y = t * verticalSpacing;

        // Strand 1
        const x1 = Math.cos(curAngle) * helixRadius;
        const z1 = Math.sin(curAngle) * helixRadius;
        strand1Points.push(project3D(x1, y, z1));

        // Strand 2 (180 degrees offset)
        const x2 = Math.cos(curAngle + Math.PI) * helixRadius;
        const z2 = Math.sin(curAngle + Math.PI) * helixRadius;
        strand2Points.push(project3D(x2, y, z2));
      }

      // Collect all rungs with depth for back-to-front rendering
      const renderedRungs = rungs.map((rung) => {
        const curAngle = rung.t * 1.8 + angle;
        const y = rung.t * verticalSpacing;

        const x1 = Math.cos(curAngle) * helixRadius;
        const z1 = Math.sin(curAngle) * helixRadius;
        const node1 = project3D(x1, y, z1);

        const x2 = Math.cos(curAngle + Math.PI) * helixRadius;
        const z2 = Math.sin(curAngle + Math.PI) * helixRadius;
        const node2 = project3D(x2, y, z2);

        const avgZ = (node1.pz + node2.pz) / 2;

        return {
          rung,
          node1,
          node2,
          avgZ
        };
      });

      // Sort rungs by depth
      renderedRungs.sort((a, b) => a.avgZ - b.avgZ);

      // --- Draw Back Strand Segments (z < 0) ---
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      const drawBackbone = (points: { px: number; py: number; pz: number }[], color: string) => {
        for (let i = 0; i < points.length - 1; i++) {
          const pA = points[i];
          const pB = points[i + 1];
          const avgZ = (pA.pz + pB.pz) / 2;

          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.strokeStyle = color;
          ctx.globalAlpha = Math.max(0.15, Math.min(1, (avgZ + helixRadius) / (helixRadius * 2) + 0.2));
          ctx.stroke();
        }
      };

      // Strand 1 (Neon Violet)
      drawBackbone(strand1Points, '#AC58E9');
      // Strand 2 (Neon Cyan)
      drawBackbone(strand2Points, '#AC58E9');

      // --- Draw Base Pair Rungs & Genetic Nodes ---
      for (let i = 0; i < renderedRungs.length; i++) {
        const item = renderedRungs[i];
        const { node1, node2, avgZ, rung } = item;

        const depthNorm = Math.max(0, Math.min(1, (avgZ + helixRadius) / (helixRadius * 2)));
        const alpha = 0.25 + depthNorm * 0.75;

        // Connecting bridge rung
        ctx.beginPath();
        ctx.moveTo(node1.px, node1.py);
        ctx.lineTo(node2.px, node2.py);
        const bridgeGrad = ctx.createLinearGradient(node1.px, node1.py, node2.px, node2.py);
        bridgeGrad.addColorStop(0, '#AC58E9');
        bridgeGrad.addColorStop(0.5, '#FFFFFF');
        bridgeGrad.addColorStop(1, '#AC58E9');
        ctx.strokeStyle = bridgeGrad;
        ctx.lineWidth = 2.2 * ((node1.scale + node2.scale) / 2);
        ctx.globalAlpha = alpha;
        ctx.stroke();

        // Node 1 (Purple Helix Backbone)
        ctx.beginPath();
        const r1 = Math.max(2, 4.5 * node1.scale);
        ctx.arc(node1.px, node1.py, r1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node1.px, node1.py, r1 * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#AC58E9';
        ctx.globalAlpha = alpha * 0.45;
        ctx.fill();

        // Node 2 (Cyan Helix Backbone)
        ctx.beginPath();
        const r2 = Math.max(2, 4.5 * node2.scale);
        ctx.arc(node2.px, node2.py, r2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node2.px, node2.py, r2 * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#AC58E9';
        ctx.globalAlpha = alpha * 0.45;
        ctx.fill();

        // Center gene pill label on front-facing rungs
        if (avgZ > -10) {
          const midX = (node1.px + node2.px) / 2;
          const midY = (node1.px + node2.py) / 2;

          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = Math.min(1, alpha * 1.2);
          ctx.textAlign = 'center';
          ctx.fillText(rung.label.split('_')[0], midX, midY - 6);
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
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`genome-double-helix-card ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(10, 26, 13,  0.75) 0%, rgba(5, 14, 7,  0.95) 100%)',
        border: '1px solid rgba(172, 88, 233,  0.35)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(172, 88, 233,  0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 22px',
        boxSizing: 'border-box',
        cursor: 'crosshair'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 8px #FFFFFF'
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#AC58E9', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              3D QUANT GENOME SYNTHESIS
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {activePair ? activePair.replace(/_/g, ' ') : `GEN ${generation} ACTIVE`}
          </div>
        </div>

        {/* 3D Orientation */}
        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>HELIX AXIS</div>
          <div style={{ fontSize: 11, color: '#FFFFFF', fontWeight: 800, marginTop: 2 }}>
            P:{tiltStats.pitch} R:{tiltStats.roll}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
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
            <div style={{ fontSize: 9, color: '#71717A', fontWeight: 700 }}>SYNTHESIZED GENES</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace" }}>
              {activeGenesCount} ALLELES
            </div>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <div style={{ fontSize: 9, color: '#71717A', fontWeight: 700 }}>HELD-OUT PASS</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#AC58E9', fontFamily: "'JetBrains Mono', monospace" }}>
              {healthScore ? `${healthScore}% GATES` : '38 / 40 GATES'}
            </div>
          </div>
        </div>

        <span style={{ fontSize: 10, color: '#c084fc', fontWeight: 700 }}>
          🧬 ROTATE ON MOUSE
        </span>
      </div>
    </div>
  );
};
