import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
  size?: number;
  label?: string;
  sublabel?: string;
  hideLabels?: boolean;
}

export const HolographicAICore: React.FC<Props> = ({
  className,
  size = 120,
  label = 'QUANTUM AI REACTOR',
  sublabel = 'KRONOS MULTI-HORIZON ENGINE',
  hideLabels = false
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.6) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const ringSize = Math.round(size * 0.82);
  const cubeSize = Math.round(size * 0.44);
  const aiGlyphSize = Math.round(cubeSize * 0.52);

  return (
    <div
      className={`holographic-ai-core-container ${className || ''}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 800
      }}
    >
      {/* Outer Glow Halo */}
      <div
        style={{
          position: 'absolute',
          inset: Math.round(size * 0.08),
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(172, 88, 233, 0.45) 0%, rgba(172, 88, 233, 0.25) 45%, transparent 75%)',
          filter: `blur(${Math.round(size * 0.12)}px)`,
          animation: 'pulseGlow 3s ease-in-out infinite alternate'
        }}
      />

      {/* Outer 3D Circular Planetary Ring 1 (Stardust Image 5 - Circular ring tilted via rotateX/rotateZ) */}
      <div
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: '1.2px solid rgba(172, 88, 233, 0.75)',
          boxShadow: '0 0 14px rgba(172, 88, 233, 0.5)',
          transform: `rotateZ(-25deg) rotateX(68deg) rotateZ(${rotation}deg)`,
          transformStyle: 'preserve-3d',
          pointerEvents: 'none'
        }}
      >
        {/* Electron bead */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: Math.max(5, Math.round(size * 0.045)),
            height: Math.max(5, Math.round(size * 0.045)),
            borderRadius: '50%',
            background: '#AC58E9',
            boxShadow: '0 0 10px #AC58E9, 0 0 18px #AC58E9',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Outer 3D Circular Planetary Ring 2 (Stardust Image 5 - Counter-rotation) */}
      <div
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: '1.2px dashed rgba(172, 88, 233, 0.7)',
          boxShadow: '0 0 14px rgba(172, 88, 233, 0.4)',
          transform: `rotateZ(35deg) rotateX(68deg) rotateZ(${-rotation * 0.8}deg)`,
          transformStyle: 'preserve-3d',
          pointerEvents: 'none'
        }}
      >
        {/* Electron bead */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: Math.max(5, Math.round(size * 0.045)),
            height: Math.max(5, Math.round(size * 0.045)),
            borderRadius: '50%',
            background: '#AC58E9',
            boxShadow: '0 0 10px #AC58E9, 0 0 18px #AC58E9',
            transform: 'translate(-50%, 50%)'
          }}
        />
      </div>

      {/* Central 3D Glass Holographic Cube (Reference 1 NEURA FLOW) */}
      <div
        style={{
          position: 'relative',
          width: cubeSize,
          height: cubeSize,
          borderRadius: Math.round(cubeSize * 0.22),
          background: 'linear-gradient(135deg, rgba(172, 88, 233, 0.4) 0%, rgba(172, 88, 233, 0.3) 50%, rgba(172, 88, 233, 0.35) 100%)',
          border: '1.2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 30px rgba(172, 88, 233, 0.6), inset 0 0 18px rgba(172, 88, 233, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(3deg)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(172, 88, 233, 0.9), inset 0 0 25px rgba(172, 88, 233, 0.7)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1.0) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(172, 88, 233, 0.6), inset 0 0 18px rgba(172, 88, 233, 0.4)';
        }}
      >
        {/* Glowing Brain / AI Glyph */}
        <div
          style={{
            width: aiGlyphSize,
            height: aiGlyphSize,
            borderRadius: Math.round(aiGlyphSize * 0.28),
            background: 'linear-gradient(135deg, #AC58E9 0%, #AC58E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(172, 88, 233, 0.75)',
            marginBottom: 2
          }}
        >
          <span style={{ fontSize: Math.max(10, Math.round(aiGlyphSize * 0.48)), fontWeight: 900, color: '#ffffff', letterSpacing: 0.5 }}>
            AI
          </span>
        </div>

        {/* Microchip Circuitry Lines */}
        <div style={{ fontSize: Math.max(7, Math.round(cubeSize * 0.16)), fontWeight: 900, color: '#ffffff', letterSpacing: 0.8, fontFamily: "'JetBrains Mono', monospace" }}>
          QUANTUM
        </div>

        {/* Glowing Corner Accents */}
        <span style={{ position: 'absolute', top: 4, left: 4, width: 4, height: 4, borderTop: '1.5px solid #AC58E9', borderLeft: '1.5px solid #AC58E9' }} />
        <span style={{ position: 'absolute', top: 4, right: 4, width: 4, height: 4, borderTop: '1.5px solid #AC58E9', borderRight: '1.5px solid #AC58E9' }} />
        <span style={{ position: 'absolute', bottom: 4, left: 4, width: 4, height: 4, borderBottom: '1.5px solid #AC58E9', borderLeft: '1.5px solid #AC58E9' }} />
        <span style={{ position: 'absolute', bottom: 4, right: 4, width: 4, height: 4, borderBottom: '1.5px solid #AC58E9', borderRight: '1.5px solid #AC58E9' }} />
      </div>

      {/* Floating Labels (optional) */}
      {!hideLabels && (
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 900, color: '#ffffff', letterSpacing: 1.2, fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 10px rgba(172, 88, 233, 0.8)' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: 8, color: '#c084fc', fontWeight: 700, letterSpacing: 0.4 }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
