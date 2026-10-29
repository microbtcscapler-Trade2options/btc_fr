import React from 'react';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const SpotlightBeamHero: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={`spotlight-beam-hero-container ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 10,
        overflow: 'visible'
      }}
    >
      {/* 1. Soft Cosmic Ambient Glow (No harsh polygon/triangle stretching) */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          maxWidth: 900,
          height: 480,
          background: 'radial-gradient(ellipse 65% 55% at 50% 20%, rgba(172, 88, 233, 0.28) 0%, rgba(172, 88, 233, 0.16) 45%, rgba(172, 88, 233, 0.08) 70%, transparent 100%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* 2. Soft Luminous Center Aura */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          maxWidth: 550,
          height: 300,
          background: 'radial-gradient(circle at 50% 30%, rgba(172, 88, 233, 0.25) 0%, rgba(172, 88, 233, 0.2) 50%, transparent 80%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* 3. Horizontal Subtle Cyan/Purple Light Beam Accent */}
      <div
        style={{
          position: 'absolute',
          top: 75,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          maxWidth: 700,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(172, 88, 233, 0.6) 25%, rgba(172, 88, 233, 0.95) 50%, rgba(172, 88, 233, 0.6) 75%, transparent 100%)',
          boxShadow: '0 0 20px rgba(172, 88, 233, 0.8), 0 0 40px rgba(172, 88, 233, 0.5)',
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0.85
        }}
      />

      {/* Child Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
