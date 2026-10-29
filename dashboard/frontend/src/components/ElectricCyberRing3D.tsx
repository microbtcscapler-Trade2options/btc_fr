import React, { useState, useRef } from 'react';

interface Props {
  action?: string;
  confidence?: number;
  latency?: string;
  className?: string;
  onTriggerTick?: () => void;
}

export const ElectricCyberRing3D: React.FC<Props> = ({
  action = 'BUY MOMENTUM',
  confidence = 85,
  latency = '2.8ms',
  className,
  onTriggerTick
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 22,
      y: x * 22
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleTrigger = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 900);
    if (onTriggerTick) onTriggerTick();
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`electric-cyber-ring-card ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(22, 10, 48, 0.75) 0%, rgba(6, 16, 8,  0.95) 100%)',
        border: '1px solid rgba(172, 88, 233,  0.35)',
        boxShadow: isHovered
          ? '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(172, 88, 233,  0.35)'
          : '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(172, 88, 233,  0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 22px',
        boxSizing: 'border-box',
        perspective: '1000px',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
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
                background: '#AC58E9',
                boxShadow: '0 0 8px #AC58E9'
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              ELECTRIC CYBER PORTAL RING
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {action}
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>MT5 GATEWAY</div>
          <div style={{ fontSize: 11, color: '#AC58E9', fontWeight: 800, marginTop: 2 }}>
            ⚡ {latency}
          </div>
        </div>
      </div>

      {/* Center 3D Interactive Cyber Ring Stage */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ring 1: Expanding Shockwave Pulse (Pinterest 4) */}
        <div
          className={`electric-expanding-ring ${isPulsing ? 'pulse-active' : ''}`}
          style={{
            position: 'absolute',
            width: '190px',
            height: '190px',
            borderRadius: '50%',
            border: '2px solid rgba(172, 88, 233,  0.8)',
            boxShadow: '0 0 35px rgba(172, 88, 233,  0.6), inset 0 0 25px rgba(172, 88, 233,  0.4)',
            animation: 'electricShockwave 3s infinite ease-out'
          }}
        />

        {/* Ring 2: Rotating Outer Dashed Reticle */}
        <div
          style={{
            position: 'absolute',
            width: '165px',
            height: '165px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(172, 88, 233,  0.55)',
            boxShadow: '0 0 20px rgba(172, 88, 233,  0.25)',
            animation: 'spinClockwise 16s linear infinite'
          }}
        />

        {/* Ring 3: Vivid Conic Neon Gradient Ring (Pink to Purple to Cyan) */}
        <div
          style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            padding: '3px',
            background: 'conic-gradient(from 0deg, #FFFFFF, #AC58E9, #AC58E9, #AC58E9, #FFFFFF)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #fff 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #fff 0)',
            animation: 'spinCounterClockwise 8s linear infinite',
            filter: 'drop-shadow(0 0 12px rgba(172, 88, 233,  0.8))'
          }}
        />

        {/* Ring 4: Concentric Angle Tick Points */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{
            position: 'absolute',
            animation: 'spinClockwise 28s linear infinite'
          }}
        >
          <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 9" />
          <line x1="90" y1="10" x2="90" y2="18" stroke="#AC58E9" strokeWidth="2" />
          <line x1="90" y1="162" x2="90" y2="170" stroke="#AC58E9" strokeWidth="2" />
          <line x1="10" y1="90" x2="18" y2="90" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="162" y1="90" x2="170" y2="90" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {/* Center Core HUD Readout with Glassmorphic Plate */}
        <div
          style={{
            position: 'relative',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(13, 34, 17,  0.95) 0%, rgba(13, 5, 28, 0.98) 100%)',
            border: '1.5px solid rgba(192, 132, 252,  0.5)',
            boxShadow: '0 0 30px rgba(172, 88, 233,  0.4), inset 0 0 18px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 800, color: '#c084fc', letterSpacing: 0.8 }}>
            CONFIDENCE
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#FFFFFF',
              marginTop: 2,
              textShadow: '0 0 12px rgba(172, 88, 233,  0.8)'
            }}
          >
            {confidence}%
          </span>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#AC58E9', letterSpacing: 0.5, marginTop: 2 }}>
            ORDER_GATE: PASS
          </span>
        </div>
      </div>

      {/* Bottom Action Strip */}
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
        <span style={{ fontSize: 10, color: '#c084fc', fontWeight: 700 }}>
          ⚡ 3D TILT ON CURSOR
        </span>

        <button
          onClick={handleTrigger}
          className="shimmer-sweep"
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid rgba(172, 88, 233,  0.5)',
            background: 'linear-gradient(135deg, rgba(172, 88, 233,  0.3) 0%, rgba(172, 88, 233,  0.4) 100%)',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 0 14px rgba(172, 88, 233,  0.35)',
            transition: 'all 0.2s ease',
            pointerEvents: 'auto'
          }}
        >
          TRIGGER TICK PULSE
        </button>
      </div>
    </div>
  );
};
