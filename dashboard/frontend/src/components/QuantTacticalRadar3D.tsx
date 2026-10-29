import React, { useEffect, useRef, useState, useCallback } from 'react';

interface RadarBlip {
  id: string;
  label: string;
  sublabel: string;
  angle: number; // in radians (0 to 2*PI)
  dist: number;  // 0.1 to 0.9 (normalized radius)
  category: 'WHALE' | 'LIQUIDATION' | 'GAMMA' | 'ICEBERG' | 'TRAP';
  color: string;
  size: number;
  lastPingTime: number;
  pingRadius: number;
  active: boolean;
}

interface Props {
  currentPrice?: number;
  className?: string;
}

export const QuantTacticalRadar3D: React.FC<Props> = ({
  currentPrice = 81700,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sweepSpeed, setSweepSpeed] = useState<number>(1.0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [lockedBlip, setLockedBlip] = useState<RadarBlip | null>(null);

  // Mouse telemetry on scope
  const [cursorTelemetry, setCursorTelemetry] = useState({
    azimuth: '042°',
    distance: '38.4 km',
    estLiquidity: '$24.8M',
    active: false,
    scopeX: 0,
    scopeY: 0
  });

  // Radar Blips State
  const blipsRef = useRef<RadarBlip[]>([
    {
      id: 'blip_1',
      label: 'WHALE LIMIT BID',
      sublabel: '420 BTC @ $81,200',
      angle: 0.65,
      dist: 0.42,
      category: 'WHALE',
      color: '#AC58E9',
      size: 5.5,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    },
    {
      id: 'blip_2',
      label: 'SHORT LIQUIDATION POOL',
      sublabel: '$18.4M Cluster @ $82,850',
      angle: 1.85,
      dist: 0.68,
      category: 'LIQUIDATION',
      color: '#AC58E9',
      size: 6.0,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    },
    {
      id: 'blip_3',
      label: 'DERIBIT GAMMA PIN',
      sublabel: '2,800 Calls @ $85,000',
      angle: 2.95,
      dist: 0.82,
      category: 'GAMMA',
      color: '#FFFFFF',
      size: 6.5,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    },
    {
      id: 'blip_4',
      label: 'BINANCE ICEBERG WALL',
      sublabel: 'Sub-second absorption 180 BTC',
      angle: 4.15,
      dist: 0.35,
      category: 'ICEBERG',
      color: '#AC58E9',
      size: 5.0,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    },
    {
      id: 'blip_5',
      label: 'STOP-HUNT VOLATILITY TRAP',
      sublabel: 'Algorithmic Sweep Trap @ $80,450',
      angle: 5.25,
      dist: 0.76,
      category: 'TRAP',
      color: '#7928ca',
      size: 6.0,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    },
    {
      id: 'blip_6',
      label: 'CME GAP MAGNET',
      sublabel: 'Weekend Delta Rebalance $81,950',
      angle: 0.15,
      dist: 0.28,
      category: 'WHALE',
      color: '#AC58E9',
      size: 4.8,
      lastPingTime: 0,
      pingRadius: 0,
      active: true
    }
  ]);

  const customPingsRef = useRef<{ x: number; y: number; r: number; alpha: number; color: string }[]>([]);

  // 3D Tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: -y * 22,
      y: x * 22
    });

    // Check scope coords relative to canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cRect = canvas.getBoundingClientRect();
    const cX = e.clientX - cRect.left;
    const cY = e.clientY - cRect.top;

    if (cX >= 0 && cX <= cRect.width && cY >= 0 && cY <= cRect.height) {
      const centerX = cRect.width / 2;
      const centerY = cRect.height / 2;
      const dx = cX - centerX;
      const dy = cY - centerY;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const maxR = cRect.width / 2;

      let angleRad = Math.atan2(dy, dx);
      if (angleRad < 0) angleRad += Math.PI * 2;
      const degrees = Math.round((angleRad * 180) / Math.PI);
      const distKm = ((distPx / maxR) * 100).toFixed(1);
      const estLiq = `$${(10 + (distPx / maxR) * 40).toFixed(1)}M`;

      setCursorTelemetry({
        azimuth: `${degrees.toString().padStart(3, '0')}°`,
        distance: `${distKm} km`,
        estLiquidity: estLiq,
        active: true,
        scopeX: cX,
        scopeY: cY
      });

      // Target lock check
      let locked: RadarBlip | null = null;
      blipsRef.current.forEach(blip => {
        const bx = centerX + Math.cos(blip.angle) * (blip.dist * maxR);
        const by = centerY + Math.sin(blip.angle) * (blip.dist * maxR);
        const bdist = Math.sqrt((cX - bx) * (cX - bx) + (cY - by) * (cY - by));
        if (bdist < 22) {
          locked = blip;
        }
      });
      setLockedBlip(locked);
    } else {
      setCursorTelemetry(prev => ({ ...prev, active: false }));
      setLockedBlip(null);
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setCursorTelemetry(prev => ({ ...prev, active: false }));
    setLockedBlip(null);
  };

  // Click on radar adds custom tactical ping
  const handleScopeClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    customPingsRef.current.push({
      x,
      y,
      r: 4,
      alpha: 1.0,
      color: '#AC58E9'
    });
  };

  // Full Sector Sweep Pulse Trigger
  const handleTriggerSectorSweep = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let r = 20; r < canvas.width / 2; r += 40) {
      customPingsRef.current.push({
        x: centerX,
        y: centerY,
        r,
        alpha: 0.9,
        color: '#FFFFFF'
      });
    }

    // Ping all blips
    blipsRef.current.forEach(blip => {
      blip.lastPingTime = Date.now();
      blip.pingRadius = 2;
    });
  }, []);

  // Main 3D Radar Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = (width / 2) - 16;

      // 1. Radar Screen Dark Void
      ctx.fillStyle = '#030804';
      ctx.fillRect(0, 0, width, height);

      // Radial Cosmic Ambient Glow
      const ambientGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
      ambientGlow.addColorStop(0, 'rgba(172, 88, 233,  0.08)');
      ambientGlow.addColorStop(0.6, 'rgba(172, 88, 233,  0.05)');
      ambientGlow.addColorStop(1, 'rgba(7, 3, 16, 0.95)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Concentric Range Rings (Nautical / Liquidity Bands)
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      const ringLabels = ['25k', '50k', '75k', '100k'];

      ringSteps.forEach((step, idx) => {
        const r = maxRadius * step;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === ringSteps.length - 1 ? 'rgba(172, 88, 233,  0.45)' : 'rgba(172, 88, 233,  0.2)';
        ctx.lineWidth = idx === ringSteps.length - 1 ? 1.8 : 1;
        ctx.stroke();

        // Distance range tag
        ctx.font = '700 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(172, 88, 233,  0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(ringLabels[idx], centerX + 4, centerY - r + 11);
      });

      // 3. Compass Radial Spokes (30-degree increments)
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX + cos * 15, centerY + sin * 15);
        ctx.lineTo(centerX + cos * maxRadius, centerY + sin * maxRadius);
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(172, 88, 233,  0.25)' : 'rgba(172, 88, 233,  0.1)';
        ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.8;
        ctx.stroke();

        // Cardinal Direction labels (000°, 090°, 180°, 270°)
        if (i % 3 === 0) {
          const cardinal = i === 0 ? '090°' : i === 3 ? '180°' : i === 6 ? '270°' : '000°';
          const labelDist = maxRadius + 10;
          ctx.font = '800 8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#AC58E9';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cardinal, centerX + cos * labelDist, centerY + sin * labelDist);
        }
      }

      // 4. Rotating Phosphor Sweep Beam (The signature 360° radar sweep)
      sweepAngle += 0.035 * sweepSpeed;
      if (sweepAngle >= Math.PI * 2) sweepAngle -= Math.PI * 2;

      // Sweeping Phosphor Fan Gradient (trail behind beam)
      const fanAngle = Math.PI / 3.5; // ~51 degrees phosphor decay
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, sweepAngle - fanAngle, sweepAngle, false);
      ctx.closePath();

      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
      sweepGrad.addColorStop(0, 'rgba(172, 88, 233,  0.45)');
      sweepGrad.addColorStop(0.5, 'rgba(172, 88, 233,  0.15)');
      sweepGrad.addColorStop(1, 'rgba(172, 88, 233,  0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sharp Leading Edge Laser Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * maxRadius, centerY + Math.sin(sweepAngle) * maxRadius);
      ctx.strokeStyle = '#AC58E9';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#AC58E9';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 5. Detect and Render Radar Blips
      blipsRef.current.forEach(blip => {
        const bx = centerX + Math.cos(blip.angle) * (blip.dist * maxRadius);
        const by = centerY + Math.sin(blip.angle) * (blip.dist * maxRadius);

        // Check if sweep beam is currently passing over this blip
        const angleDiff = Math.abs(sweepAngle - blip.angle);
        const isSwept = angleDiff < 0.08 || Math.abs(angleDiff - Math.PI * 2) < 0.08;

        if (isSwept) {
          blip.lastPingTime = Date.now();
          blip.pingRadius = 4;
        }

        const timeSincePing = Date.now() - blip.lastPingTime;
        const isFresh = timeSincePing < 1800;
        const decayAlpha = Math.max(0.25, 1 - timeSincePing / 1800);

        // Expanding Radar Ping Wave on detection
        if (blip.pingRadius > 0 && blip.pingRadius < 35) {
          blip.pingRadius += 1.2;
          ctx.beginPath();
          ctx.arc(bx, by, blip.pingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = blip.color;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = Math.max(0, 1 - blip.pingRadius / 35);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Blip Diamond / Dot
        ctx.beginPath();
        ctx.arc(bx, by, blip.size * (isSwept ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = blip.color;
        ctx.globalAlpha = isFresh ? 1.0 : decayAlpha;
        ctx.shadowColor = blip.color;
        ctx.shadowBlur = isFresh ? 14 : 4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Blip Micro-Tag Label
        if (isFresh || isHovered) {
          ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = blip.color;
          ctx.textAlign = 'left';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(blip.label, bx + 8, by - 2);

          ctx.font = '700 7.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#CBD5E1';
          ctx.fillText(blip.sublabel, bx + 8, by + 8);
          ctx.shadowBlur = 0;
        }
      });

      // 6. Custom Interactive User Click Pings
      customPingsRef.current.forEach((ping, pIdx) => {
        ping.r += 2.2;
        ping.alpha -= 0.025;

        if (ping.alpha <= 0 || ping.r > 90) {
          customPingsRef.current.splice(pIdx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.r, 0, Math.PI * 2);
        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, ping.alpha);
        ctx.shadowColor = ping.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // 7. Interactive Crosshair Target Reticle
      if (cursorTelemetry.active) {
        const sx = cursorTelemetry.scopeX;
        const sy = cursorTelemetry.scopeY;

        ctx.strokeStyle = '#AC58E9';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);

        // Reticle Lines
        ctx.beginPath();
        ctx.moveTo(sx - 18, sy);
        ctx.lineTo(sx + 18, sy);
        ctx.moveTo(sx, sy - 18);
        ctx.lineTo(sx, sy + 18);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Lock Circle
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.strokeStyle = lockedBlip ? '#FFFFFF' : '#AC58E9';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Target HUD Box
        if (lockedBlip) {
          ctx.fillStyle = 'rgba(8, 22, 10,  0.92)';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.fillRect(sx + 16, sy - 24, 150, 44);
          ctx.strokeRect(sx + 16, sy - 24, 150, 44);

          ctx.font = '800 8.5px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.fillText(`TARGET LOCKED: ${lockedBlip.category}`, sx + 22, sy - 12);

          ctx.font = '700 8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(lockedBlip.sublabel, sx + 22, sy + 2);

          ctx.fillStyle = '#AC58E9';
          ctx.fillText(`CONF: 94.6% • R:R 1:3.2`, sx + 22, sy + 14);
        }
      }

      // 8. Center Sensor Origin Node
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#AC58E9';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sweepSpeed, cursorTelemetry, lockedBlip, isHovered]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`quant-tactical-radar-card ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '380px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(8, 22, 10,  0.88) 0%, rgba(4, 12, 6,  0.96) 100%)',
        border: '1px solid rgba(172, 88, 233,  0.35)',
        boxShadow: isHovered
          ? '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(172, 88, 233,  0.25)'
          : '0 16px 45px rgba(0, 0, 0, 0.75), 0 0 20px rgba(172, 88, 233,  0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 24px',
        boxSizing: 'border-box',
        perspective: '900px',
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Top Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#AC58E9',
                boxShadow: '0 0 10px #AC58E9'
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 900, color: '#AC58E9', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              3D QUANT TACTICAL LIQUIDITY RADAR
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                background: 'rgba(172, 88, 233,  0.18)',
                color: '#AC58E9',
                padding: '2px 8px',
                borderRadius: '10px',
                border: '1px solid rgba(172, 88, 233,  0.4)'
              }}
            >
              360° ACTIVE SWEEP
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            BTC/USDT &bull; ${currentPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
            Real-time radar sweep tracking institutional whale blocks, gamma walls &amp; liquidation pools
          </div>
        </div>

        {/* Top Right Sweep Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
          {/* Speed Pills */}
          <div className="segmented-pill-container" style={{ padding: '3px 6px', background: 'rgba(11, 29, 14,  0.8)' }}>
            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, paddingLeft: 6 }}>SWEEP:</span>
            {[1.0, 2.0, 4.0].map(sp => (
              <button
                key={sp}
                onClick={() => setSweepSpeed(sp)}
                className={`segmented-pill-btn ${sweepSpeed === sp ? 'segmented-pill-btn-active' : ''}`}
                style={{ padding: '3px 8px', fontSize: 10 }}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* Trigger Sector Sweep Button */}
          <button
            onClick={handleTriggerSectorSweep}
            className="control-pill-btn shimmer-sweep"
            style={{
              padding: '6px 14px',
              fontSize: 10.5,
              fontWeight: 900,
              color: '#AC58E9',
              borderColor: 'rgba(172, 88, 233,  0.5)',
              background: 'rgba(172, 88, 233,  0.15)'
            }}
            title="Fire full sector sonar sweep"
          >
            🎯 PING SECTOR
          </button>
        </div>
      </div>

      {/* Center 3D Interactive Radar Scope */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '12px 0',
          transform: `perspective(850px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
          transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          onClick={handleScopeClick}
          style={{
            borderRadius: '50%',
            cursor: 'crosshair',
            boxShadow: '0 0 35px rgba(172, 88, 233,  0.25), inset 0 0 25px rgba(0, 0, 0, 0.8)'
          }}
        />

        {/* Outer Circular Elevation Glow Rim */}
        <div
          style={{
            position: 'absolute',
            width: '372px',
            height: '372px',
            borderRadius: '50%',
            border: '1.5px solid rgba(172, 88, 233,  0.35)',
            boxShadow: '0 0 25px rgba(172, 88, 233,  0.2)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Bottom Telemetry Strip & Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          background: 'rgba(6, 16, 8,  0.85)',
          border: '1px solid rgba(172, 88, 233,  0.25)',
          borderRadius: '14px',
          padding: '8px 16px',
          backdropFilter: 'blur(16px)',
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>AZIMUTH: </span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#AC58E9' }}>{cursorTelemetry.azimuth}</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>DISTANCE: </span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#FFFFFF' }}>{cursorTelemetry.distance}</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.1)' }} />
          <div>
            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>EST LIQ: </span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#AC58E9' }}>{cursorTelemetry.estLiquidity}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 9.5, fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#AC58E9' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9', boxShadow: '0 0 6px #AC58E9' }} />
            <span>WHALE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#AC58E9' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#AC58E9', boxShadow: '0 0 6px #AC58E9' }} />
            <span>LIQ POOL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FFFFFF' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 6px #FFFFFF' }} />
            <span>GAMMA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
