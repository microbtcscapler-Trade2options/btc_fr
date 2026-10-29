import React, { useState, useRef, MouseEvent } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Interactive3DCard: React.FC<Props> = ({
  children,
  className = '',
  maxTilt = 12,
  glowColor = 'rgba(172, 88, 233,  0.22)',
  onClick,
  style = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1

    setTilt({
      x: normY * -maxTilt,
      y: normX * maxTilt
    });

    setSpotlight({
      x,
      y,
      opacity: 1
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`interactive-3d-card ${isHovered ? 'card-hovered' : ''} ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) ${isHovered ? 'translateZ(14px) scale3d(1.02, 1.02, 1.02)' : 'translateZ(0px) scale3d(1, 1, 1)'}`,
        transition: isHovered
          ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* Specular Spotlight Following Cursor */}
      <div
        className="card-spotlight-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, ${glowColor}, transparent 70%)`,
          opacity: spotlight.opacity,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          zIndex: 1
        }}
      />

      {/* Card Content with z-index above spotlight */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
};
